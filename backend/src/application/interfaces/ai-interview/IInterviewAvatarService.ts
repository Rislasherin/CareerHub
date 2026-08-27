export interface IInterviewAvatarService {
  /**
   * Initializes and starts the optional avatar for a specific interview session.
   * This method MUST be non-blocking and catch all errors so it never disrupts the main interview.
   * 
   * @param sessionId The interview session ID (used as the room name).
   * @param liveKitUrl The LiveKit server URL that the avatar should connect to.
   * @param liveKitToken The LiveKit token granting the avatar access to the room.
   */
  startAvatar(sessionId: string, liveKitUrl: string, liveKitToken: string): Promise<void>;

  /**
   * Cleans up the avatar session if necessary.
   */
  disconnectAvatar(sessionId: string): Promise<void>;
}
