export interface IExtendCollegeTrialUseCase {
  execute(orgId: string, days: number): Promise<void>;
}
