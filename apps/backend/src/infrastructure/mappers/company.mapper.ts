import { Company } from "@domain/entities/Company";
import { CompanyDocument } from "@infrastructure/database/models/company/company.model";

export const toCompanyEntity = (doc: CompanyDocument): Company => {
  return Company.create({
    id: doc._id.toString(),
    name: doc.name,
    sector: doc.sector ?? undefined,
    size: doc.size ?? undefined,
    location: doc.location ?? undefined,
    contactName: doc.contactName ?? undefined,
    contactEmail: doc.contactEmail ?? undefined,
    contactPhone: doc.contactPhone ?? undefined,
    onboardingStep: doc.onboardingStep,
    status: doc.status as "active" | "inactive",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
};

export const toCompanyPersistence = (entity: Company) => {
  const props = entity.toJSON();

  return {
    name: props.name,
    sector: props.sector,
    size: props.size,
    location: props.location,
    contactName: props.contactName,
    contactEmail: props.contactEmail,
    contactPhone: props.contactPhone,
    onboardingStep: props.onboardingStep,
    status: props.status,
  };
};
