export interface ILoginInterviewerUseCase {
  execute(dto: { email: string; password: string; [key: string]: unknown }): Promise<any>;
}
