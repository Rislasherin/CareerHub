import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { JobType } from "@domain/enums/JobType.enum";
import { JobDocument } from "@infrastructure/database/models/company/job.model";

interface RawJobProps {
  eligibility?: {
    minCGPA?: number;
    allowedBacklogs?: number;
    eligibleBranches?: string[];
    passingYear?: number;
    degreeType?: string;
  };
  approvedColleges?: string[];
  rejectedColleges?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const toJobEntity = (doc: JobDocument): Job => {
  const rawDoc = doc as unknown as RawJobProps;
  return Job.create({
    id: doc._id.toString(),
    companyId: doc.companyId,
    collegeId: doc.collegeId,
    title: doc.title,
    category: doc.category,
    openings: doc.openings,
    deadline: doc.deadline,
    type: doc.type as JobType,
    eligibility: {
      minCGPA: rawDoc.eligibility?.minCGPA ?? 0,
      allowedBacklogs: rawDoc.eligibility?.allowedBacklogs ?? 0,
      eligibleBranches: rawDoc.eligibility?.eligibleBranches ?? [],
      passingYear: rawDoc.eligibility?.passingYear ?? 0,
      degreeType: rawDoc.eligibility?.degreeType ?? ""
    },
    noticePeriod: doc.noticePeriod,
    experienceLevel: doc.experienceLevel,
    workMode: doc.workMode as "on-site" | "remote" | "hybrid",
    location: doc.location,
    salaryType: doc.salaryType as "per_month" | "per_year",
    minSalary: doc.minSalary,
    maxSalary: doc.maxSalary,
    interviewMode: doc.interviewMode as "online" | "offline" | "hybrid",
    description: doc.description,
    requiredSkills: doc.requiredSkills,
    preferredSkills: doc.preferredSkills || [],
    rounds: doc.rounds.map((round: { roundNumber: number; name: string; type: string; description?: string | null }) => ({
      roundNumber: round.roundNumber,
      name: round.name,
      type: round.type as "aptitude" | "coding" | "technical" | "hr" | "group_discussion",
      description: round.description ?? undefined
    })),
    status: doc.status as JobStatus,
    rejectionNote: doc.rejectionNote || undefined,
    approvedColleges: rawDoc.approvedColleges || [],
    rejectedColleges: rawDoc.rejectedColleges || [],
    createdAt: rawDoc.createdAt,
    updatedAt: rawDoc.updatedAt,
    isDeleted: doc.isDeleted || false
  });
};

export const toJobPersistence = (entity: Job) => {
  const props = entity.toJSON();

  return {
    companyId: props.companyId,
    collegeId: props.collegeId,
    title: props.title,
    category: props.category,
    openings: props.openings,
    deadline: props.deadline,
    type: props.type,
    eligibility: {
      minCGPA: props.eligibility.minCGPA,
      allowedBacklogs: props.eligibility.allowedBacklogs,
      eligibleBranches: props.eligibility.eligibleBranches,
      passingYear: props.eligibility.passingYear,
      degreeType: props.eligibility.degreeType
    },
    noticePeriod: props.noticePeriod,
    experienceLevel: props.experienceLevel,
    workMode: props.workMode,
    location: props.location,
    salaryType: props.salaryType,
    minSalary: props.minSalary,
    maxSalary: props.maxSalary,
    interviewMode: props.interviewMode,
    description: props.description,
    requiredSkills: props.requiredSkills,
    preferredSkills: props.preferredSkills || [],
    rounds: props.rounds.map((round: any) => ({
      roundNumber: round.roundNumber,
      name: round.name,
      type: round.type,
      description: round.description
    })),
    status: props.status,
    rejectionNote: props.rejectionNote,
    approvedColleges: props.approvedColleges,
    rejectedColleges: props.rejectedColleges,
    isDeleted: props.isDeleted || false
  };
};
