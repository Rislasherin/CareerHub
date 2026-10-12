export interface IUpdateUserStatusUseCase {
  execute(role: string, id: string, status: string, adminRole?: string, reason?: string, adminId?: string): Promise<void>;
}
