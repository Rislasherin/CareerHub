export interface IGetStudentApplicationsUseCase {
  execute(studentId: string): Promise<any[]>;
}
