export interface ILoginCollegeAdminUseCase {
  execute(dto: Record<string, unknown>): Promise<any>;
}
