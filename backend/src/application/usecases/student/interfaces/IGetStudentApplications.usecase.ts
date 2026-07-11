export interface IGetStudentApplicationsUseCase {
  execute(studentId: string): Promise<Record<string, unknown>[]>;
}
