import { UserStatus } from "../enums/user.status.enum";

export interface VerificationDocument {
  id: string;
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: Date;
}

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
  verificationDocuments?: VerificationDocument[];
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

  get verificationDocuments(): VerificationDocument[] | undefined {
    return this.props.verificationDocuments;
  }

  addVerificationDocument(doc: VerificationDocument): void {
    if (!this.props.verificationDocuments) {
      this.props.verificationDocuments = [];
    }
    // Prevent duplicate entries for same file / id
    const existingIndex = this.props.verificationDocuments.findIndex(
      d => d.id === doc.id || (d.fileName === doc.fileName && d.category === doc.category)
    );
    if (existingIndex >= 0) {
      this.props.verificationDocuments[existingIndex] = doc;
    } else {
      this.props.verificationDocuments.push(doc);
    }
    if (!this.props.verificationDocument) {
      this.props.verificationDocument = doc.fileUrl;
    }
  }

  removeVerificationDocument(docId: string): void {
    if (!this.props.verificationDocuments) return;
    this.props.verificationDocuments = this.props.verificationDocuments.filter(d => d.id !== docId);
    if (this.props.verificationDocuments.length > 0) {
      this.props.verificationDocument = this.props.verificationDocuments[0].fileUrl;
    } else {
      this.props.verificationDocument = undefined;
    }
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

