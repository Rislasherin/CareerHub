import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";

export interface IGetInterviewersUseCase {
  execute(companyId: string, query: string, page: number, limit: number, includeDeleted?: boolean): Promise<any>;
}
