import { Offer } from "@domain/entities/Offer";

export interface IGetStudentOffersUseCase {
    execute(studentId: string): Promise<Record<string, unknown>[]>;
}
