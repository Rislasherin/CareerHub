import { IEmailService } from "@application/services/IEmailService";

export class MockEmailService implements IEmailService {
  async sendInterviewerSetupEmail(email: string, setupLink: string): Promise<void> {
    console.log(`[MockEmailService] Sending setup email to ${email}`);
    console.log(`[MockEmailService] Setup link: ${setupLink}`);
  }
}
