export interface IGenerateProfessionalSummaryUseCase {
    execute(studentId: string): Promise<string>;
}
