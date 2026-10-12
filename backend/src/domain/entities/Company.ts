import { UserStatus } from "../enums/user.status.enum";

export interface CompanyProps {
  id?: string;
  name: string;
  industry?: string;
  sector?: string;
  website?: string;
  headquarters?: string;
  location?: string;
  description?: string;
  size?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactJobTitle?: string;
  logoUrl?: string;
  preferredColleges?: string[];
  onboardingStep: number;
  status: UserStatus;
  rejectionReason?: string;
  rejectedAt?: Date;
  resubmittedAt?: Date;
  approvedAt?: Date;
  verificationDocument?: string;
  statusHistory?: Array<{
    status: UserStatus;
    changedAt: Date;
    changedBy?: string;
    reason?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Company {
  constructor(private props: CompanyProps) { }

  static create(props: CompanyProps): Company {
    return new Company(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get industry(): string | undefined {
    return this.props.industry;
  }

  get sector(): string | undefined {
    return this.props.sector;
  }

  get website(): string | undefined {
    return this.props.website;
  }

  get headquarters(): string | undefined {
    return this.props.headquarters;
  }

  get size(): string | undefined {
    return this.props.size;
  }

  get location(): string | undefined {
    return this.props.location;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get contactName(): string | undefined {
    return this.props.contactName;
  }

  get contactEmail(): string | undefined {
    return this.props.contactEmail;
  }

  get contactPhone(): string | undefined {
    return this.props.contactPhone;
  }

  get contactJobTitle(): string | undefined {
    return this.props.contactJobTitle;
  }

  get logoUrl(): string | undefined {
    return this.props.logoUrl;
  }

  get preferredColleges(): string[] | undefined {
    return this.props.preferredColleges;
  }

  get onboardingStep(): number {
    return this.props.onboardingStep;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  set status(value: UserStatus) {
    this.props.status = value;
  }

  get rejectionReason(): string | undefined {
    return this.props.rejectionReason;
  }

  get rejectedAt(): Date | undefined {
    return this.props.rejectedAt;
  }

  get resubmittedAt(): Date | undefined {
    return this.props.resubmittedAt;
  }

  get approvedAt(): Date | undefined {
    return this.props.approvedAt;
  }

  get verificationDocument(): string | undefined {
    return this.props.verificationDocument;
  }

  get statusHistory(): Array<{ status: UserStatus; changedAt: Date; changedBy?: string; reason?: string }> | undefined {
    return this.props.statusHistory;
  }

  approve(adminId?: string): void {
    this.props.status = UserStatus.ACTIVE;
    this.props.approvedAt = new Date();
    this.props.rejectionReason = undefined;
    this.addStatusHistory(UserStatus.ACTIVE, adminId, "Company approved by administrator");
  }

  reject(reason: string, adminId?: string): void {
    this.props.status = UserStatus.REJECTED;
    this.props.rejectionReason = reason;
    this.props.rejectedAt = new Date();
    this.addStatusHistory(UserStatus.REJECTED, adminId, reason);
  }

  resubmit(): void {
    this.props.status = UserStatus.PENDING;
    this.props.resubmittedAt = new Date();
    this.addStatusHistory(UserStatus.PENDING, undefined, "Company application resubmitted for review");
  }

  addStatusHistory(status: UserStatus, changedBy?: string, reason?: string): void {
    if (!this.props.statusHistory) {
      this.props.statusHistory = [];
    }
    this.props.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy,
      reason
    });
  }

  toJSON(): CompanyProps {
    return { ...this.props };
  }
}

