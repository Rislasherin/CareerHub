import { Schema } from "mongoose";
import { UserStatus } from "@domain/enums/user.status.enum";

export const studentSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING },
    collegeId: { type: String, required: true },
    proofUrl: { type: String, required: true },
    isFirstLogin: { type: Boolean, default: false },
  },
  { timestamps: true }
);
