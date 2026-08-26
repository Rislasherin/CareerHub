import { AccessToken } from 'livekit-server-sdk';
import { ILiveKitService } from "@application/interfaces/ai-interview/ILiveKitService";
import { env } from "@infrastructure/config/env.validator";
import { Logger, LogCategory } from '../../logger/logger';

export class LiveKitService implements ILiveKitService {

	async generateToken(sessionId: string, studentId: string, studentName: string): Promise<string> {
		const at = new AccessToken(env.LIVEKIT_API_KEY as string, env.LIVEKIT_API_SECRET as string, {
			identity: studentId,
			name: studentName,
			ttl: env.LIVEKIT_TOKEN_TTL || '2h',
		});

		at.addGrant({
			roomJoin: true,
			room: sessionId,
			canPublish: true,
			canSubscribe: true,
			canPublishData: true
		});
		return await at.toJwt();
	}

	async generateWorkerToken(sessionId: string): Promise<string> {
		const at = new AccessToken(env.LIVEKIT_API_KEY as string, env.LIVEKIT_API_SECRET as string, {
			identity: "ai-interviewer",
			name: "AI Interviewer",
			ttl: env.LIVEKIT_TOKEN_TTL || '2h',
		});

		at.addGrant({
			roomJoin: true,
			room: sessionId,
			canPublish: true,
			canSubscribe: true,
			canPublishData: true
		});
		return await at.toJwt();
	}

	async deleteRoom(sessionId: string): Promise<void> {
		try {
			const { RoomServiceClient } = await import('livekit-server-sdk');
			const svc = new RoomServiceClient(env.LIVEKIT_URL as string, env.LIVEKIT_API_KEY as string, env.LIVEKIT_API_SECRET as string);
			await svc.deleteRoom(sessionId);
		} catch (err: unknown) {
			const error = err as { message?: string };
			if (!error.message?.includes('not found')) {
				Logger.error(LogCategory.SYSTEM_ERROR, `[LiveKitService] Error deleting room ${sessionId}:`, err);
			}
		}
	}
}