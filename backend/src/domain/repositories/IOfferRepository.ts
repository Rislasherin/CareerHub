import { Offer } from "@domain/entities/Offer";
import { IBaseRepository } from "./IBaseRepository";

export interface IOfferRepository extends IBaseRepository<Offer> {
    findByCompanyId(companyId: string): Promise<Offer[]>;
    findByStudentId(studentId: string): Promise<Offer[]>;
    getPopulatedStudentOffers(studentId: string): Promise<Record<string, unknown>[]>;
    getPopulatedHROffers(companyId: string): Promise<Record<string, unknown>[]>;
}