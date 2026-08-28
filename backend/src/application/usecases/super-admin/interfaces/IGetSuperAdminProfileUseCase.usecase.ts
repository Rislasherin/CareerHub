export interface IGetSuperAdminProfileUseCase {
  execute(id: string): Promise<any>;
}
