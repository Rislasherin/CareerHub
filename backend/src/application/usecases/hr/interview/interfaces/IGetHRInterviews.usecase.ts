export interface IGetHRInterviewsUseCase {
  execute(companyId: string): Promise<any[]>;
}
