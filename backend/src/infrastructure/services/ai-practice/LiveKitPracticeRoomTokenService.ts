import { AccessToken } from "livekit-server-sdk";
import { IPracticeRoomTokenService } from "@application/interfaces/ai-practice/IPracticeRoomTokenService";
import { env } from "@infrastructure/config/env.validator";

export class LiveKitPracticeRoomTokenService implements IPracticeRoomTokenService {
  async generateStudentToken(roomName: string, studentId: string, studentName: string): Promise<string> {
    const at = new AccessToken(env.LIVEKIT_API_KEY as string, env.LIVEKIT_API_SECRET as string, {
      identity: `practice-student-${studentId}`,
      name: studentName,
      ttl: env.LIVEKIT_TOKEN_TTL || "2h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return await at.toJwt();
  }

  async generateWorkerToken(roomName: string, workerName: string): Promise<string> {
    const at = new AccessToken(env.LIVEKIT_API_KEY as string, env.LIVEKIT_API_SECRET as string, {
      identity: `practice-worker-${roomName}`,
      name: workerName,
      ttl: env.LIVEKIT_TOKEN_TTL || "2h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      hidden: false,
    });

    return await at.toJwt();
  }
}
