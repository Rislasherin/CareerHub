export interface VerifyTokenResponse {
  firstName: string;
  lastName: string;
  email: string;
}

export interface IVerifyInvitationTokenUseCase {
  execute(token: string): Promise<VerifyTokenResponse>;
}
