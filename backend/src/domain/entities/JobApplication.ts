import { JobApplicationStatus } from "../enums/JobApplicationStatus.enum";

export interface JobApplicationProps {
  id?: string;
  jobId: string;
  studentId: string;
  companyId: string;
  resumeUrl?: string; // Snapshot of the resume they applied with
  resumeId?: string; // Public ID if using Cloudinary
  status: JobApplicationStatus;
  hrNotes?: string;
  appliedAt?: Date;
  updatedAt?: Date;
}

export class JobApplication {
  constructor(private props: JobApplicationProps) {}

  static create(props: JobApplicationProps): JobApplication {
    return new JobApplication({
      ...props,
      status: props.status || JobApplicationStatus.APPLIED,
      appliedAt: props.appliedAt || new Date(),
    });
  }

  get id(): string | undefined { return this.props.id; }
  get jobId(): string { return this.props.jobId; }
  get studentId(): string { return this.props.studentId; }
  get companyId(): string { return this.props.companyId; }
  get resumeUrl(): string | undefined { return this.props.resumeUrl; }
  get resumeId(): string | undefined { return this.props.resumeId; }
  get status(): JobApplicationStatus { return this.props.status; }
  get hrNotes(): string | undefined { return this.props.hrNotes; }
  get appliedAt(): Date | undefined { return this.props.appliedAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  updateStatus(newStatus: JobApplicationStatus, hrNotes?: string): void {
    this.props.status = newStatus;
    if (hrNotes) {
      this.props.hrNotes = hrNotes;
    }
    this.props.updatedAt = new Date();
  }

  toJSON(): JobApplicationProps {
    return { ...this.props };
  }
}
