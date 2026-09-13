export interface ISignOfferUseCase {
    execute(studentId: string, offerId: string, signatureFile: Express.Multer.File): Promise<Record<string, unknown>>;
}
