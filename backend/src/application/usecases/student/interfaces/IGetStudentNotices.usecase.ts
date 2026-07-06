export interface IGetStudentNoticesUseCase {
  execute(studentId: string): Promise<any>;
}
