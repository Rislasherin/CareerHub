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
    type: "aptitude" | "coding" | "technical" | "hr" | "group_discussion";
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
            rejectedColleges: this.rejectedColleges
        };
    }
}


