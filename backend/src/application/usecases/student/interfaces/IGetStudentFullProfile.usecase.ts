export interface IGetStudentFullProfileUseCase {
  execute(studentId: string): Promise<Record<string, unknown>>;
}
