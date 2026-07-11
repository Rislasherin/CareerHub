export interface IGetStudentInterviewsUseCase {
    execute(studentId: string, page: number, limit: number): Promise<{ interviews: Record<string, unknown>[], total: number }>
}