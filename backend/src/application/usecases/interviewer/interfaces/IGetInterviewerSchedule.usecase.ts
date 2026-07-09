import { Interviewer } from "@domain/entities/Interviewer";

export interface IGetInterviewerScheduleUseCase {
    execute(interviewerId: string): Promise<any[]>
}