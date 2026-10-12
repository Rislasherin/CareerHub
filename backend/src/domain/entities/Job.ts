import { JobStatus } from "@domain/enums/JobStatus.enum";
import { JobType } from "@domain/enums/JobType.enum";

export interface EligibilityCriteria {
    minCGPA: number;
    allowedBacklogs: number;
    eligibleBranches: string[];
    passingYear: number;
    degreeType: string;
}

export interface InterviewRoundConfig {
    roundNumber: number;
    name: string;
    type: "APTITUDE" | "CODING" | "TECHNICAL" | "HR" | "GROUP_DISCUSSION";
    description?: string;
}

export interface JobProps {
    id?: string;
    companyId: string;
    collegeId: string;
    title: string;
    category: string;
    openings: number;
    deadline: Date;
    type: JobType;
    eligibility: EligibilityCriteria;
    noticePeriod: string;
    experienceLevel: string;
    workMode: "on-site" | "remote" | "hybrid";
    location: string;
    salaryType: "per_month" | "per_year";
    minSalary: number;
    maxSalary: number;
    interviewMode: "online" | "offline" | "hybrid";
    description: string;
    requiredSkills: string[];
    preferredSkills?: string[];
    rounds: InterviewRoundConfig[];
    status: JobStatus;
    rejectionNote?: string;
    closureReason?: string;
    closedAt?: Date;
    scheduledPublishAt?: Date;
    scheduledTimezone?: string;
    publishOption?: "publish_now" | "draft" | "schedule";
    approvedColleges?: string[];
    rejectedColleges?: string[];
    applicantCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
}

export class Job {
    constructor(private props: JobProps) { }

    static create(props: JobProps): Job {
        return new Job({
            ...props,
            status: props.status || JobStatus.PENDING_REVIEW,
            isDeleted: props.isDeleted ?? false
        })
    }
    get id(): string | undefined { return this.props.id; }
    get companyId(): string { return this.props.companyId; }
    get collegeId(): string { return this.props.collegeId; }
    get title(): string { return this.props.title; }
    get category(): string { return this.props.category; }
    get openings(): number { return this.props.openings; }
    get deadline(): Date { return this.props.deadline; }
    get type(): JobType { return this.props.type; }
    get noticePeriod(): string { return this.props.noticePeriod; }
    get experienceLevel(): string { return this.props.experienceLevel; }
    get workMode(): "on-site" | "remote" | "hybrid" { return this.props.workMode; }
    get location(): string { return this.props.location; }
    get salaryType(): "per_month" | "per_year" { return this.props.salaryType; }
    get minSalary(): number { return this.props.minSalary; }
    get maxSalary(): number { return this.props.maxSalary; }
    get interviewMode(): "online" | "offline" | "hybrid" { return this.props.interviewMode; }
    get description(): string { return this.props.description; }
    get requiredSkills(): string[] { return this.props.requiredSkills; }
    get preferredSkills(): string[] | undefined { return this.props.preferredSkills; }
    get rounds(): InterviewRoundConfig[] { return this.props.rounds; }
    get status(): JobStatus { return this.props.status; }

    set status(value: JobStatus) { this.props.status = value; }

    get rejectionNote(): string | undefined { return this.props.rejectionNote; }
    set rejectionNote(value: string | undefined) { this.props.rejectionNote = value; }

    get closureReason(): string | undefined { return this.props.closureReason; }
    get closedAt(): Date | undefined { return this.props.closedAt; }
    get scheduledPublishAt(): Date | undefined { return this.props.scheduledPublishAt; }
    get scheduledTimezone(): string | undefined { return this.props.scheduledTimezone; }
    get publishOption(): "publish_now" | "draft" | "schedule" | undefined { return this.props.publishOption; }

    get eligibility(): EligibilityCriteria { return this.props.eligibility; }
    get approvedColleges(): string[] { return this.props.approvedColleges || []; }
    get rejectedColleges(): string[] { return this.props.rejectedColleges || []; }

    approveForCollege(collegeId: string): void {
        if (!this.props.approvedColleges) this.props.approvedColleges = [];
        if (!this.props.approvedColleges.includes(collegeId)) {
            this.props.approvedColleges.push(collegeId);
        }
        // Remove from rejected if it was there
        if (this.props.rejectedColleges) {
            this.props.rejectedColleges = this.props.rejectedColleges.filter(id => id !== collegeId);
        }
    }

    rejectForCollege(collegeId: string): void {
        if (!this.props.rejectedColleges) this.props.rejectedColleges = [];
        if (!this.props.rejectedColleges.includes(collegeId)) {
            this.props.rejectedColleges.push(collegeId);
        }
        // Remove from approved if it was there
        if (this.props.approvedColleges) {
            this.props.approvedColleges = this.props.approvedColleges.filter(id => id !== collegeId);
        }
    }

    schedulePublish(publishAt: Date, timezone?: string): void {
        if (publishAt.getTime() <= Date.now()) {
            throw new Error("Scheduled publication date must be in the future");
        }
        if (this.props.deadline && this.props.deadline.getTime() <= publishAt.getTime()) {
            throw new Error("Application deadline must be after the scheduled publication date");
        }
        this.props.status = JobStatus.SCHEDULED;
        this.props.scheduledPublishAt = publishAt;
        this.props.scheduledTimezone = timezone;
        this.props.publishOption = "schedule";
    }

    cancelSchedule(): void {
        if (this.props.status !== JobStatus.SCHEDULED) {
            throw new Error("Only scheduled jobs can have their schedule cancelled");
        }
        this.props.status = JobStatus.DRAFT;
        this.props.scheduledPublishAt = undefined;
        this.props.publishOption = "draft";
    }

    publishNow(): void {
        if (this.props.status === JobStatus.CLOSED) {
            throw new Error("Cannot publish a closed job. Please reopen it instead.");
        }
        this.props.status = JobStatus.PENDING_REVIEW;
        this.props.scheduledPublishAt = undefined;
        this.props.publishOption = "publish_now";
    }

    isDraft(): boolean {
        return this.props.status === JobStatus.DRAFT;
    }

    isScheduled(): boolean {
        return this.props.status === JobStatus.SCHEDULED;
    }

    close(reason?: string): void {
        this.props.status = JobStatus.CLOSED;
        this.props.closureReason = reason;
        this.props.closedAt = new Date();
    }

    reopen(newDeadline?: Date): void {
        if (newDeadline) {
            this.props.deadline = newDeadline;
        }
        if (this.props.collegeId === "ALL") {
            this.props.status = (this.props.approvedColleges && this.props.approvedColleges.length > 0)
                ? JobStatus.APPROVED
                : JobStatus.PENDING_REVIEW;
        } else {
            this.props.status = JobStatus.APPROVED;
        }
        this.props.closureReason = undefined;
        this.props.closedAt = undefined;
    }

    get applicantCount(): number | undefined { return this.props.applicantCount; }
    get createdAt(): Date | undefined { return this.props.createdAt; }
    get updatedAt(): Date | undefined { return this.props.updatedAt; }
    get isDeleted(): boolean | undefined { return this.props.isDeleted; }
    delete(): void {
        this.props.isDeleted = true;
    }
    toJSON(): JobProps {
        return {
            ...this.props,
            approvedColleges: this.approvedColleges,
            rejectedColleges: this.rejectedColleges,
            closureReason: this.props.closureReason,
            closedAt: this.props.closedAt,
            scheduledPublishAt: this.props.scheduledPublishAt,
            scheduledTimezone: this.props.scheduledTimezone,
            publishOption: this.props.publishOption
        };
    }
}

