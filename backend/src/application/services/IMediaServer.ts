export interface IMediaServer {
    createRoom(roomName: string): Promise<void>;
    generateToken(roomName: string, participantIdentity: string, canPublish: boolean): Promise<string>;
    deleteRoom(roomName: string): Promise<void>;
}   