import { Organization } from "@domain/entities/Organization";
import { UserStatus } from "@domain/enums/user.status.enum";
import { OrganizationDocument } from "@infrastructure/database/models/organizer/organization.model";

export const toOrganizationEntity = (doc: OrganizationDocument): Organization => {
    return Organization.create({
        id: doc._id.toString(),
        name: doc.name,
        city: doc.city || '',
        state: doc.state || '',
        studentCountRange: doc.studentCountRange || '',
        shortName: doc.shortName || undefined,
        yearEstablished: doc.yearEstablished || undefined,
        address: doc.address || undefined,
        naacGrade: doc.naacGrade || undefined,
        placementCellName: doc.placementCellName || undefined,
        placementContactEmail: doc.placementContactEmail || undefined,
        placementContactPhone: doc.placementContactPhone || undefined,
        activeBranches: doc.activeBranches || [],
        currentAcademicYear: doc.currentAcademicYear || undefined,
        activePlacementBatch: doc.activePlacementBatch || undefined,
        plan: doc.plan || undefined,
        logoUrl: doc.logoUrl || undefined,
        onboardingStep: doc.onboardingStep || 0,
        website: doc.website || undefined,
        status: doc.status as UserStatus,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    });
}

export const toOrganizationPersistence = (entity: Organization) => {
    const props = entity.toJSON();
    return {
        name: props.name,
        city: props.city,
        state: props.state,
        studentCountRange: props.studentCountRange,
        shortName: props.shortName,
        yearEstablished: props.yearEstablished,
        address: props.address,
        naacGrade: props.naacGrade,
        placementCellName: props.placementCellName,
        placementContactEmail: props.placementContactEmail,
        placementContactPhone: props.placementContactPhone,
        activeBranches: props.activeBranches,
        currentAcademicYear: props.currentAcademicYear,
        activePlacementBatch: props.activePlacementBatch,
        plan: props.plan,
        logoUrl: props.logoUrl,
        onboardingStep: props.onboardingStep,
        website: props.website,
        status: props.status
    }
}