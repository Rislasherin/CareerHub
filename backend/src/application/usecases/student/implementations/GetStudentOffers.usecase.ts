import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IGetStudentOffersUseCase } from "../interfaces/IGetStudentOffers.usecase";

export class GetStudentOffersUseCase implements IGetStudentOffersUseCase {
  constructor(private readonly _offerRepository: IOfferRepository) {}

  async execute(studentId: string, page: number = 1, limit: number = 10): Promise<{ offers: Record<string, unknown>[], total: number }> {
    const offers = await this._offerRepository.getPopulatedStudentOffers(studentId);
    const total = offers.length;
    const startIndex = (page - 1) * limit;
    const paginatedOffers = offers.slice(startIndex, startIndex + limit);
    return { offers: paginatedOffers, total };
  }
}
