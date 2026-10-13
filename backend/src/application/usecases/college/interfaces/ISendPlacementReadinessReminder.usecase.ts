export interface ISendPlacementReadinessReminderUseCase {
  execute(collegeId: string, studentId: string, recommendedAction: string): Promise<boolean>;
}
