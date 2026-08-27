import { IInterviewAvatarService } from "@application/interfaces/ai-interview/IInterviewAvatarService";
import { env } from "@infrastructure/config/env.validator";
import { Logger, LogCategory } from "@infrastructure/logger/logger";
import { AccessToken } from 'livekit-server-sdk';
import { randomUUID } from "crypto";

export class TavusAvatarService implements IInterviewAvatarService {
  private readonly baseUrl = 'https://tavusapi.com/v2';
  private static readonly AVATAR_AGENT_IDENTITY = 'tavus-avatar-agent';

  async startAvatar(sessionId: string, liveKitUrl: string, liveKitToken: string): Promise<void> {
    Logger.info(LogCategory.SYSTEM_INFO, `[TavusAvatarService] avatar start requested for session: ${sessionId}`);

    if (env.AI_AVATAR_ENABLED !== 'true') {
      Logger.info(LogCategory.SYSTEM_INFO, `[TavusAvatarService] avatar disabled because of configuration`);
      return;
    }

    const apiKey = env.TAVUS_API_KEY;
    const faceId = env.TAVUS_REPLICA_ID;

    if (!apiKey || !faceId) {
      Logger.warn(LogCategory.SYSTEM_INFO, '[TavusAvatarService] AI_AVATAR_ENABLED is true, but TAVUS_API_KEY or TAVUS_REPLICA_ID is missing.');
      return;
    }

    try {
      Logger.info(LogCategory.SYSTEM_INFO, `[TavusAvatarService] Ensuring Echo PAL exists for faceId: ${faceId}`);
      
      const palId = await this.ensureEchoPal(apiKey, faceId);
      
      if (!palId) {
        Logger.error(LogCategory.SYSTEM_ERROR, '[TavusAvatarService] avatar startup failed (PAL creation error).');
        return;
      }

      // Generate a LiveKit token for the Tavus Avatar Participant
      const at = new AccessToken(env.LIVEKIT_API_KEY as string, env.LIVEKIT_API_SECRET as string, {
        identity: TavusAvatarService.AVATAR_AGENT_IDENTITY,
        name: 'Tavus Avatar',
        ttl: '2h'
      });
      at.addGrant({ roomJoin: true, room: sessionId });
      
      // REQUIRED for Tavus Echo Mode: The avatar must know it is publishing on behalf of the AI worker
      // This maps the data channel streams correctly.
      (at as any).attributes = {
        'lk.publish_on_behalf': 'ai-interviewer'
      };
      const avatarLivekitToken = await at.toJwt();

      Logger.info(LogCategory.SYSTEM_INFO, `[TavusAvatarService] Creating conversation for session: ${sessionId} using PAL: ${palId}`);
      Logger.info(LogCategory.SYSTEM_INFO, `[TavusAvatarService] Tavus API request started`);

      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          face_id: faceId,
          pal_id: palId,
          properties: {
            livekit_ws_url: liveKitUrl,
            livekit_room_token: avatarLivekitToken
          },
          conversation_name: `lk_conversation_${sessionId}`
        })
      });

      if (!response.ok) {
        const text = await response.text();
        Logger.error(LogCategory.SYSTEM_ERROR, `[TavusAvatarService] Failed to create conversation: ${response.status} ${text}`);
        return;
      }

      const data = await response.json();
      Logger.info(LogCategory.SYSTEM_INFO, `[TavusAvatarService] Avatar conversation created successfully. Conversation ID: ${data.conversation_id}`);
      Logger.info(LogCategory.SYSTEM_INFO, `[TavusAvatarService] returned conversation/room information (without secrets): ${JSON.stringify({
        status: data.status,
        conversation_name: data.conversation_name
      })}`);

    } catch (error) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[TavusAvatarService] Unhandled error starting avatar:`, error);
    }
  }

  async disconnectAvatar(sessionId: string): Promise<void> {
    // If we wanted to manually end the conversation, we'd need to store the conversation ID.
    // However, since LiveKit room closing drops all participants, Tavus will auto-disconnect.
    // We can leave this as a no-op or implement full cleanup if required.
    Logger.info(LogCategory.SYSTEM_INFO, `[TavusAvatarService] Disconnect called for session: ${sessionId}`);
  }

  private async ensureEchoPal(apiKey: string, faceId: string): Promise<string | null> {
    const palName = `Echo_LiveKit_PAL_${faceId}`;
    
    // Check if it already exists (optimistic approach, though usually we can just create and it might return an existing or a new one, but let's just create one if we don't store it)
    // To avoid creating hundreds of PALs, we should ideally fetch existing PALs, or just create one. 
    // For simplicity and safety, we will just create one per session or rely on a predefined TAVUS_PAL_ID.
    
    // Instead of querying and paginating all PALs, we can just create a new PAL per session, 
    // OR we could require TAVUS_PAL_ID to be passed in env. Let's create it dynamically and log it.
    
    try {
      const payload = {
        pal_name: `lk_pal_${randomUUID().substring(0, 8)}`,
        default_face_id: faceId,
        pipeline_mode: "echo",
        layers: {
          transport: { transport_type: "livekit" }
        }
      };
      
      const response = await fetch(`${this.baseUrl}/pals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const text = await response.text();
        Logger.error(LogCategory.SYSTEM_ERROR, `[TavusAvatarService] Error creating PAL: ${response.status} ${text}`);
        return null;
      }
      
      const data = await response.json();
      return data.pal_id;
    } catch (e) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[TavusAvatarService] ensureEchoPal error:`, e);
      return null;
    }
  }
}
