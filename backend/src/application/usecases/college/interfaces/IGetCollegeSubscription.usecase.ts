export interface IGetCollegeSubscriptionUseCase {
  execute(collegeId: string): Promise<any>;
}
