import { Schema } from "mongoose";
import { UserStatus } from "@domain/enums/user.status.enum";

export const studentSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false }, // Password optional initially during invite
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING_INVITE },
    blockedBy: { type: String, required: false },
    collegeId: { type: String, required: true },
    proofUrl: { type: String, required: false },
    rollNumber: { type: String, required: false },
    department: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    rejectReason: { type: String, required: false },
    invitationToken: { type: String, required: false },
    invitationExpiresAt: { type: Date, required: false },
    isFirstLogin: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);
