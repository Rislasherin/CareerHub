export interface IGetStudentApplicationsUseCase {
  execute(studentId: string, page: number, limit: number): Promise<{ applications: Record<string, unknown>[], total: number }>;
}
