import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";

export interface IGetStudentsUseCase {
  execute(query: string, page: number, limit: number, studentId:string,interviewId:string): Promise<any>;

}
