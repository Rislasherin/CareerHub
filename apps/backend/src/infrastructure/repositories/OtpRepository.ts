import { IOtpRepository } from "@domain/repositories/IOtpRepository";
import { OtpModel, OtpDocument } from "@infrastructure/database/models/auth/otp.model";

export class OtpRepository implements IOtpRepository {
  async create(email: string, otp: string): Promise<OtpDocument> {
    // Delete type existing OTPs for this email first
    await this.deleteByEmail(email);
    const newOtp = new OtpModel({ email, otp });
    return await newOtp.save();
  }

  async findByEmailAndOtp(email: string, otp: string): Promise<OtpDocument | null> {
    return await OtpModel.findOne({ email, otp }).exec();
  }

  async deleteByEmail(email: string): Promise<void> {
    await OtpModel.deleteMany({ email }).exec();
  }
}
