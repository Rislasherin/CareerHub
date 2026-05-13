import dotenv from "dotenv";
import path from "path";

// Load .env BEFORE importing EmailService
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { EmailService } from "../src/infrastructure/services/email/email.service"
async function testEmail() {
  const emailService = new EmailService();
  console.log("Sending test OTP email...");
  
  const success = await emailService.sendOTP(
    "rislasherin09@gmail.com",
    "123456",
    "Test Organization"
  );

  if (success) {
    console.log("✅ Test email sent successfully! Check your inbox.");
  } else {
    console.log("❌ Failed to send test email. Check the console for errors.");
  }
}

testEmail().catch(console.error);
