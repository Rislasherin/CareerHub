import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IGetStudentOffersUseCase } from "../interfaces/IGetStudentOffers.usecase";

export class GetStudentOffersUseCase implements IGetStudentOffersUseCase {
  constructor(private readonly _offerRepository: IOfferRepository) { }

  async execute(studentId: string): Promise<Record<string, unknown>[]> {
    return await this._offerRepository.getPopulatedStudentOffers(studentId);
  }
}
