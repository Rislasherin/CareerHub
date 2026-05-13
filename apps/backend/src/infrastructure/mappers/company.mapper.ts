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
  };
};
