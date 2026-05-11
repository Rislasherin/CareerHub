export interface IEmailService {
  sendInterviewerSetupEmail(email: string, setupLink: string): Promise<void>;
}
