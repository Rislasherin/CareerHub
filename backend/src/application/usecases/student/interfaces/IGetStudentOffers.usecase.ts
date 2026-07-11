import { Offer } from "@domain/entities/Offer";

export interface IGetStudentOffersUseCase {
    execute(studentId: string, page: number, limit: number): Promise<{ offers: Record<string, unknown>[], total: number }>;
}
