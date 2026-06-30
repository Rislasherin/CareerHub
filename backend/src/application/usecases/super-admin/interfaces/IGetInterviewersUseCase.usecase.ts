import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";

export interface IGetInterviewersUseCase {
  execute(query: string, page: number, limit: number): Promise<any>;
}
