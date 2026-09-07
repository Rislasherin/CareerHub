export interface IGetStudentDashboardStatsUseCase {
  execute(studentId: string): Promise<any>; // Will be typed with StudentDashboardStatsResponseDTO
}
