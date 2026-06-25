export interface IUpdateOrganizationPlanUseCase {
  execute(id: string, plan: string): Promise<void>;
}
