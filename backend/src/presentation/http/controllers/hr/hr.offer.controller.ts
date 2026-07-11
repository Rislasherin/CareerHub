import { GenerateOfferDto } from "@application/dtos/hr/Request/GenerateOffer.dto";
import { AppError } from "@application/errors/AppError";
import { IGenerateOfferUseCase } from "@application/usecases/hr/offer-engine/interfaces/IGenerateOffer.usecase";
import { IGetHROffersUseCase } from "@application/usecases/hr/offer-engine/interfaces/IGetHROffers.usecase";
import { IResendOfferEmailUseCase } from "@application/usecases/hr/offer-engine/interfaces/IResendOfferEmail.usecase";
import { IGenerateOfferPdfUseCase } from "@application/usecases/hr/offer-engine/interfaces/IGenerateOfferPdf.usecase";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { Request, Response } from "express";
import { MESSAGES } from "@shared/constants/messages.constants";

export class HROfferController {
    constructor(
        private readonly _generateOfferUseCase: IGenerateOfferUseCase,
        private readonly _getHROffersUseCase: IGetHROffersUseCase,
        private readonly _resendOfferEmailUseCase: IResendOfferEmailUseCase,
        private readonly _generateOfferPdfUseCase: IGenerateOfferPdfUseCase
    ) { }

    generateOffer = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const data: GenerateOfferDto = req.body
        const offer = await this._generateOfferUseCase.execute(companyId, data);
        sendSuccess(res, offer, MESSAGES.SUCCESS.OFFER_GENERATED, HttpStatus.CREATED);
    })
    getHROffers = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const offers = await this._getHROffersUseCase.execute(companyId);
        sendSuccess(res, offers, MESSAGES.SUCCESS.OFFERS_RETRIEVED, HttpStatus.OK);
    });

    resendOfferEmail = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const { id } = req.params;

        await this._resendOfferEmailUseCase.execute(companyId, id);

        sendSuccess(res, null, MESSAGES.SUCCESS.OFFER_EMAIL_RESENT, HttpStatus.OK);
    });

    downloadOfferPdf = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;
        if (!companyId) {
            throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const { id } = req.params;
        const pdfBuffer = await this._generateOfferPdfUseCase.execute(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `inline; filename="offer_${id}.pdf"`
        });

        res.send(pdfBuffer);
    });
}