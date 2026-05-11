import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";

export interface IGetInterviewersUseCase {
  execute(query: string, page: number, limit: number): Promise<any>;
}

export class GetInterviewersUseCase implements IGetInterviewersUseCase {
  constructor(private readonly _interviewerRepository: IInterviewerRepository) {}

  async execute(query: string, page: number, limit: number) {
    const { interviewers, total } = await this._interviewerRepository.searchAllInterviewers(query, page, limit);
    return {
      interviewers: interviewers.map(i => {
          const json = i.toJSON();
          return {
              id: json.id,
              firstName: json.firstName,
              lastName: json.lastName,
              email: json.email,
              status: json.status,
              companyId: json.companyId,
              createdAt: json.createdAt
          };
      }),
      total,
      page,
      limit
    };
  }
}
