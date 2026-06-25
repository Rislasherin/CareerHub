import { IEmailService } from "@application/services/IEmailService";

export class MockEmailService implements IEmailService {
  async sendInterviewerSetupEmail(email: string, setupLink: string): Promise<void> {
    console.log(`[MockEmailService] Sending setup email to ${email}`);
    console.log(`[MockEmailService] Setup link: ${setupLink}`);
  }

  async sendOTP(email: string, otp: string, companyName: string): Promise<boolean> {
    console.log(`[MockEmailService] Sending OTP ${otp} to ${email} for company ${companyName}`);
    return true;
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    console.log(`[MockEmailService] Sending password reset link to ${email}`);
    console.log(`[MockEmailService] Reset link: ${resetLink}`);
  }

  async sendStudentInvitationEmail(email: string, setupLink: string): Promise<void> {
    console.log(`[MockEmailService] Sending student invitation link to ${email}`);
    console.log(`[MockEmailService] Setup link: ${setupLink}`);
  }
}
