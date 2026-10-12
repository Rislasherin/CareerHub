import { Company } from "@domain/entities/Company";
import { CompanyDocument } from "@infrastructure/database/models/company/company.model";
import { UserStatus } from "@domain/enums/user.status.enum";

export const toCompanyEntity = (doc: CompanyDocument): Company => {
  return Company.create({
    id: doc._id.toString(),
    name: doc.name,
    industry: doc.industry ?? undefined,
    sector: doc.sector ?? undefined,
    size: doc.size ?? undefined,
    location: doc.location ?? undefined,
    headquarters: doc.headquarters ?? undefined,
    website: doc.website ?? undefined,
    description: doc.description ?? undefined,
    contactName: doc.contactName ?? undefined,
    contactEmail: doc.contactEmail ?? undefined,
    contactPhone: doc.contactPhone ?? undefined,
    contactJobTitle: doc.contactJobTitle ?? undefined,
    logoUrl: doc.logoUrl ?? undefined,
    preferredColleges: doc.preferredColleges ?? [],
    onboardingStep: doc.onboardingStep || 0,
    status: doc.status as UserStatus,
    rejectionReason: (doc as any).rejectionReason ?? undefined,
    rejectedAt: (doc as any).rejectedAt ?? undefined,
    resubmittedAt: (doc as any).resubmittedAt ?? undefined,
    approvedAt: (doc as any).approvedAt ?? undefined,
    verificationDocument: (doc as any).verificationDocument ?? undefined,
    verificationDocuments: (doc as any).verificationDocuments
      ? (doc as any).verificationDocuments.map((d: any) => ({
          id: d.id,
          category: d.category,
          fileName: d.fileName,
          fileUrl: d.fileUrl,
          fileSize: d.fileSize,
          mimeType: d.mimeType,
          uploadedAt: d.uploadedAt
        }))
      : undefined,
    statusHistory: (doc as any).statusHistory
      ? (doc as any).statusHistory.map((h: any) => ({
          status: h.status as UserStatus,
          changedAt: h.changedAt,
          changedBy: h.changedBy,
          reason: h.reason
        }))
      : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

export const toCompanyPersistence = (entity: Company) => {
  const props = entity.toJSON();

  return {
    name: props.name,
    industry: props.industry,
    sector: props.sector,
    size: props.size,
    location: props.location,
    headquarters: props.headquarters,
    website: props.website,
    description: props.description,
    contactName: props.contactName,
    contactEmail: props.contactEmail,
    contactPhone: props.contactPhone,
    contactJobTitle: props.contactJobTitle,
    logoUrl: props.logoUrl,
    preferredColleges: props.preferredColleges,
    onboardingStep: props.onboardingStep,
    status: props.status,
    rejectionReason: props.rejectionReason,
    rejectedAt: props.rejectedAt,
    resubmittedAt: props.resubmittedAt,
    approvedAt: props.approvedAt,
    verificationDocument: props.verificationDocument,
    verificationDocuments: props.verificationDocuments,
    statusHistory: props.statusHistory,
  };
};
