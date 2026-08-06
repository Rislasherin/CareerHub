import { IMediaServer } from '@application/services/IMediaServer';
import { RoomServiceClient, AccessToken } from 'livekit-server-sdk';
export class LiveKitMediaServer implements IMediaServer {
	private readonly _client: RoomServiceClient;
	private readonly _apiKey: string;
	private readonly _apiSecret: string;

	constructor(host:string, apiKey: string, apiSecret:string) {
		this._client = new RoomServiceClient(host,apiKey,apiSecret);
		this._apiKey = apiKey;
		this._apiSecret = apiSecret;
	}

	async createRoom(roomName: string): Promise<void> {
		await this._client.createRoom({name:roomName, emptyTimeout: 60});
	}

	async generateToken(roomName: string, participantIdentity: string, canPublish: boolean): Promise<string> {
		const token = new AccessToken(this._apiKey, this._apiSecret, {
			identity: participantIdentity,
			ttl: '10m'
		});

		token.addGrant({roomJoin: true, room: roomName, canPublish});
		return await token.toJwt();
	}
	async deleteRoom(roomName: string): Promise<void> {
		await this._client.deleteRoom(roomName)
	}
}