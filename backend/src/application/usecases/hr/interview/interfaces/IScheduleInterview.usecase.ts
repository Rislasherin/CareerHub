import { Interview } from "@domain/entities/Interview";
import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";

export interface IScheduleInterviewUseCase {
  execute(hrId: string, companyId: string, payload: SheduleInterviewDto): Promise<Interview>;
}
