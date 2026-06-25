export interface IUpdateUserStatusUseCase {
  execute(role: string, id: string, status: string, adminRole?: string): Promise<void>;
}
