import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IStorageService } from "@application/interfaces/IStorageService";
import { ISignOfferUseCase } from "../interfaces/ISignOffer.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { OfferStatus } from "@domain/enums/OfferStatus.enum";

export class SignOfferUseCase implements ISignOfferUseCase {
  constructor(
    private readonly _offerRepository: IOfferRepository,
    private readonly _storageService: IStorageService
  ) {}

  async execute(studentId: string, offerId: string, signatureFile: Express.Multer.File): Promise<Record<string, unknown>> {
    const offer = await this._offerRepository.findById(offerId);

    if (!offer || offer.studentId !== studentId) {
      throw new AppError("Offer not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new AppError(`Cannot sign an offer that is already ${offer.status}`, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    if (!signatureFile || signatureFile.size === 0) {
      throw new AppError("Please provide a valid signature.", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Upload to existing storage service
    const signatureUrl = await this._storageService.uploadFile(signatureFile, 'offer_signatures');
    
    offer.sign(signatureUrl);
    
    await this._offerRepository.update(offerId, offer);

    return offer.toJson() as unknown as Record<string, unknown>;
  }
}
