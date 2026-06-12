import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";

export interface IGetInterviewersUseCase {
  execute(companyId: string, query: string, page: number, limit: number, includeDeleted?: boolean): Promise<any>;
}

export class GetInterviewersUseCase implements IGetInterviewersUseCase {
  constructor(private readonly _interviewerRepository: IInterviewerRepository) { }

  async execute(companyId: string, query: string, page: number, limit: number, includeDeleted: boolean = false) {
    const { interviewers, total } = await this._interviewerRepository.searchInterviewers(companyId, query, page, limit, includeDeleted);

    return {
      interviewers: interviewers.map((i) => {
        const json = i.toJSON();
        return {
          id: json.id,
          firstName: json.firstName,
          lastName: json.lastName,
          email: json.email,
          designation: json.designation,
          status: json.status,
          createdAt: json.createdAt,
          isDeleted: (json as any).isDeleted || false,
        };
      }),
      total,
      page,
      limit,
    };
  }
}
