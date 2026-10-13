export interface IGetStudentEntitlementsUseCase {
  execute(studentId: string): Promise<any>;
}
