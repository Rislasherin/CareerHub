import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { MESSAGES } from "@shared/constants/messages.constants";
import { Organization } from "@domain/entities/Organization";

export class PublicOrganizationController {
    constructor(private readonly _organizationRepository: IOrganizationRepository) {}

    getApprovedOrganizations = asyncHandler(async (req: Request, res: Response) => {
        // Just fetching all for now, to match the original inline behavior. 
        const result = await this._organizationRepository.searchOrganizations("", 1, 1000, "APPROVED");
        const orgs = result.organizations;
        const data = orgs.map((org: Organization) => ({
            id: org.id,
            name: org.name,
            activeBranches: org.activeBranches || []
        }));
        
        sendSuccess(res, data, MESSAGES.SUCCESS.FETCHED);
    });
}
