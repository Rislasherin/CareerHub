export interface ResolveRescheduleDto {
    interviewId: string;
    companyId: string;
    approve: boolean;
    newDate?: Date;
    newTime?: string;
}

export interface IResolveRescheduleUseCase {
    execute(data: ResolveRescheduleDto): Promise<void>;
}
