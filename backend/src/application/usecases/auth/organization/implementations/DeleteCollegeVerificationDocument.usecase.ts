import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { Organization } from "@domain/entities/Organization";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IDeleteCollegeVerificationDocumentUseCase {
  execute(orgId: string, documentId: string): Promise<ReturnType<Organization["toJSON"]>>;
}

export class DeleteCollegeVerificationDocumentUseCase implements IDeleteCollegeVerificationDocumentUseCase {
  constructor(private readonly _organizationRepository: IOrganizationRepository) {}

  async execute(orgId: string, documentId: string): Promise<ReturnType<Organization["toJSON"]>> {
    if (!orgId || !documentId) {
      throw new AppError("Organization ID and Document ID are required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const organization = await this._organizationRepository.findById(orgId);
    if (!organization) {
      throw new AppError("Organization not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    const existing = (organization.verificationDocuments || []).find(d => d.id === documentId);
    if (!existing) {
      throw new AppError("Verification document not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    organization.removeVerificationDocument(documentId);
    const updated = await this._organizationRepository.update(orgId, organization);

    return updated.toJSON();
  }
}
