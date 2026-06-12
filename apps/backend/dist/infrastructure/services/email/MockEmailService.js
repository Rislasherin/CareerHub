"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEmailService = void 0;
class MockEmailService {
    async sendInterviewerSetupEmail(email, setupLink) {
        console.log(`[MockEmailService] Sending setup email to ${email}`);
        console.log(`[MockEmailService] Setup link: ${setupLink}`);
    }
    async sendOTP(email, otp, comptypeName) {
        console.log(`[MockEmailService] Sending OTP ${otp} to ${email} for comptype ${comptypeName}`);
        return true;
    }
    async sendPasswordResetEmail(email, resetLink) {
        console.log(`[MockEmailService] Sending password reset link to ${email}`);
        console.log(`[MockEmailService] Reset link: ${resetLink}`);
    }
    async sendStudentInvitationEmail(email, setupLink) {
        console.log(`[MockEmailService] Sending student invitation link to ${email}`);
        console.log(`[MockEmailService] Setup link: ${setupLink}`);
    }
}
exports.MockEmailService = MockEmailService;
