export interface IEmailService {
  sendOTP(email: string, otp: string, companyName: string): Promise<boolean>;
  sendInterviewerSetupEmail(email: string, setupLink: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
  sendStudentInvitationEmail(email: string, setupLink: string): Promise<void>;
}
