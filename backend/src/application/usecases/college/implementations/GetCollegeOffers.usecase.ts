import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IGetCollegeOffersUseCase {
  execute(collegeId: string): Promise<Record<string, unknown>[]>;
}

export class GetCollegeOffersUseCase implements IGetCollegeOffersUseCase {
  constructor(private readonly _offerRepository: IOfferRepository) {}

  async execute(collegeId: string): Promise<Record<string, unknown>[]> {
    if (!collegeId) {
      throw new AppError("College ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const offers = await this._offerRepository.getPopulatedCollegeOffers(collegeId);
    
    // Map _id to id if necessary, format data
    return offers.map((doc: any) => ({
      ...doc,
      id: doc._id?.toString() || doc.id,
      student: doc.student ? {
        ...doc.student,
        id: doc.student._id?.toString() || doc.student.id
      } : null,
      job: doc.job ? {
        ...doc.job,
        id: doc.job._id?.toString() || doc.job.id
      } : null,
      company: doc.company ? {
        ...doc.company,
        id: doc.company._id?.toString() || doc.company.id
      } : null
    }));
  }
}
