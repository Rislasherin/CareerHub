import { Offer } from "@domain/entities/Offer";
import { OfferStatus } from "@domain/enums/OfferStatus.enum";
import { Role } from "@domain/enums/Roles.enum";
import { OfferDocument } from "@infrastructure/database/models/company/offer.model";

export const toOfferEntity = (doc: OfferDocument): Offer => {
  return Offer.create({
    id: doc._id.toString(),
    jobId: doc.jobId.toString(),
    applicationId: doc.applicationId.toString(),
    studentId: doc.studentId.toString(),
    companyId: doc.companyId.toString(),
    role: doc.role as Role,
    ctc: doc.ctc,
    joiningDate: doc.joiningDate,
    status: doc.status as OfferStatus,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt as Date,
    updatedAt: doc.updatedAt as Date
  });
};

export const toOfferPersistence = (entity: Offer): Record<string, unknown> => {
  const props = entity.toJson();
  return {
    jobId: props.jobId,
    applicationId: props.applicationId,
    studentId: props.studentId,
    companyId: props.companyId,
    role: props.role,
    ctc: props.ctc,
    joiningDate: props.joiningDate,
    status: props.status,
    expiresAt: props.expiresAt,
  };
};