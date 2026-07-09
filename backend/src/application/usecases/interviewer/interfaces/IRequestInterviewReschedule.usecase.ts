export interface RequestRescheduleDto {
    interviewId: string;
    interviewerId: string;
    reason: string;
    preferredDate: Date;
    preferredTime: string;
    noteToHr?: string;
}

export interface IRequestInterviewRescheduleUseCase {
    execute(data: RequestRescheduleDto): Promise<void>;
}
