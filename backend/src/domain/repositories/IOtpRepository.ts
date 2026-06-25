import { OtpDocument } from "@infrastructure/database/models/auth/otp.model";

export interface IOtpRepository {
  create(email: string, otp: string): Promise<OtpDocument>;
  findByEmailAndOtp(email: string, otp: string): Promise<OtpDocument | null>;
  deleteByEmail(email: string): Promise<void>;
}
