import { Schema } from "mongoose";
import { OfferStatus } from "@domain/enums/OfferStatus.enum";

export const OfferSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'JobApplication', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  
  role: { type: String, required: true },
  ctc: { type: Number, required: true },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: Object.values(OfferStatus), default: OfferStatus.PENDING },
  expiresAt: { type: Date, required: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});
