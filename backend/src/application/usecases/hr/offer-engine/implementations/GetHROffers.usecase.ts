import { IGetHROffersUseCase } from "../interfaces/IGetHROffers.usecase";
import { IOfferRepository } from "@domain/repositories/IOfferRepository";

export class GetHROffersUseCase implements IGetHROffersUseCase {
  constructor(private readonly _offerRepository: IOfferRepository) {}

  async execute(companyId: string): Promise<Record<string, unknown>[]> {
    return await this._offerRepository.getPopulatedHROffers(companyId);
  }
}
