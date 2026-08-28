export interface IEmailService {
  sendOTP(email: string, otp: string, companyName: string): Promise<boolean>;
  sendInterviewerSetupEmail(email: string, setupLink: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
  sendStudentInvitationEmail(email: string, setupLink: string): Promise<void>;
  sendAccountApprovalEmail(email: string, name: string): Promise<void>;
  sendOfferEmail(email: string, candidateName: string, role: string, companyName: string): Promise<void>;
  sendRenewalReminder(email: string, collegeName: string, planName: string, expiryDate: Date): Promise<boolean>;
}
