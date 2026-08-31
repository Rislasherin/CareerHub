import { IBaseRepository } from "../IBaseRepository";
import { AIPracticeInterview } from "../../entities/ai-practice/AIPracticeInterview";

export interface IAIPracticeInterviewRepository extends IBaseRepository<AIPracticeInterview> {
  findByStudentId(studentId: string): Promise<AIPracticeInterview[]>;
  findByIdAndStudentId(id: string, studentId: string): Promise<AIPracticeInterview | null>;
  // Concurrency Guard contract
  recordAnswerAtomically(sessionId: string, questionId: string, answer: string): Promise<boolean>;
  findLatestCompletedByStudentId(studentId: string): Promise<AIPracticeInterview | null>;
}
