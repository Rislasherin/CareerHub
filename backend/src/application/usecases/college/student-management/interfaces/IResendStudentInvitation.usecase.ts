export interface IResendStudentInvitationUseCase {
  execute(studentId: string, orgId: string): Promise<void>;
}
