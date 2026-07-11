import { GenerateOfferDto } from "@application/dtos/hr/Request/GenerateOffer.dto";
import { Offer } from "@domain/entities/Offer";

export interface IGenerateOfferUseCase {
    execute(companyId: string, data:GenerateOfferDto): Promise<Offer>
}