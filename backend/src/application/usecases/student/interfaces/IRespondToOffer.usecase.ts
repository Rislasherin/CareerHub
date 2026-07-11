import { Offer } from "@domain/entities/Offer";

export interface IRespondToOfferUseCase {
    execute(studentId: string, offerId: string, status: "ACCEPTED" | "REJECTED"): Promise<Record<string, unknown>>;
}
