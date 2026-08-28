export interface IUpdateSuperAdminProfileUseCase {
  execute(id: string, data: { firstName?: string; lastName?: string }): Promise<any>;
}
