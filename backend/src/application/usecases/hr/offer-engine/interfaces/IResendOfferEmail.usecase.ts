export interface IResendOfferEmailUseCase {
    execute(companyId: string, offerId: string): Promise<void>;
}
