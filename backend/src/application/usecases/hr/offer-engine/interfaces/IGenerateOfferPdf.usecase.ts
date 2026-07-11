export interface IGenerateOfferPdfUseCase {
    execute(offerId: string): Promise<Buffer>;
}
