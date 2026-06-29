import nodemailer from "nodemailer";
import { env } from "@infrastructure/config/env.validator";
import { IEmailService } from "@application/services/IEmailService";
import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";

export class EmailService implements IEmailService {
  private _transporter: nodemailer.Transporter;

  constructor() {
    this._transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  private async getContactEmail(): Promise<string> {
    try {
      const settingsRepo = new PlatformSettingsRepository();
      const settings = await settingsRepo.getSettings();
      return settings?.contactEmail || env.EMAIL_FROM;
    } catch {
      return env.EMAIL_FROM;
    }
  }

  async sendOTP(email: string, otp: string, companyName: string): Promise<boolean> {
    try {
      const replyTo = await this.getContactEmail();
      await this._transporter.sendMail({
        from: env.EMAIL_FROM,
        replyTo,
        to: email,
        subject: "Verify your CareerHub Organization Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Welcome to CareerHub, ${companyName}!</h2>
            <p style="color: #334155; font-size: 16px;">
              Thank you for registering your organization. To complete your setup and verify your email address, please use the following One-Time Password (OTP):
            </p>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              This code will expire in 10 minutes. If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      });

      return true;
    } catch (err) {
      console.error("Nodemailer Failed to send OTP email:", err);
      return false;
    }
  }

  async sendInterviewerSetupEmail(email: string, setupLink: string): Promise<void> {
    try {
      const replyTo = await this.getContactEmail();
      await this._transporter.sendMail({
        from: env.EMAIL_FROM,
        replyTo,
        to: email,
        subject: "Invitation to join CareerHub as an Interviewer",
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Welcome!</h2>
            <p style="color: #334155; font-size: 16px;">
              You have been invited to join CareerHub as an Interviewer for your organization.
            </p>
            <p style="color: #334155; font-size: 16px;">
              Click the button below to set up your password and access your dashboard.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Set Up Password</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${setupLink}" style="color: #4f46e5;">${setupLink}</a>
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Nodemailer Failed to send invite email:", err);
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    try {
      const replyTo = await this.getContactEmail();
      await this._transporter.sendMail({
        from: env.EMAIL_FROM,
        replyTo,
        to: email,
        subject: "Reset your CareerHub Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Password Reset Request</h2>
            <p style="color: #334155; font-size: 16px;">
              We received a request to reset your password. Click the button below to choose a new one.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              This link will expire in 1 hour. If you did not request this, please ignore this email.
            </p>
            <p style="color: #64748b; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #4f46e5;">${resetLink}</a>
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Nodemailer Failed to send reset email:", err);
    }
  }

  async sendStudentInvitationEmail(email: string, setupLink: string): Promise<void> {
    try {
      const replyTo = await this.getContactEmail();
      await this._transporter.sendMail({
        from: env.EMAIL_FROM,
        replyTo,
        to: email,
        subject: "Invitation to join CareerHub Student Portal",
        html: `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Welcome to CareerHub!</h2>
            <p style="color: #334155; font-size: 16px;">
              Your institution has invited you to join the CareerHub Placement Portal.
            </p>
            <p style="color: #334155; font-size: 16px;">
              Click the button below to set up your password and complete your profile.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Registration</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              This link will expire in 7 days.
            </p>
            <p style="color: #64748b; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${setupLink}" style="color: #4f46e5;">${setupLink}</a>
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Nodemailer Failed to send student invitation email:", err);
    }
  }
}
