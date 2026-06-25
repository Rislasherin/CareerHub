export interface IResendInterviewerInviteUseCase {
  execute(interviewerId: string): Promise<void>;
}
