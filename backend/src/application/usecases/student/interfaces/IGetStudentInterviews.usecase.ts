export interface IGetStudentInterviewsUseCase {
    execute(studentId: string): Promise<any[]>
}