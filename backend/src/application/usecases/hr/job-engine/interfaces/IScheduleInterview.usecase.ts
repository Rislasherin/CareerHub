import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";
import { Interview } from "@domain/entities/Interview";

export interface IScheduleInterviewUseCase {
    execute(companyId:string,dto:SheduleInterviewDto) :Promise<Interview>;
}
