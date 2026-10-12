import { UserStatus } from "@domain/enums/user.status.enum";
import { VerificationDocument } from "./Company";

export interface OrganizationStatusHistoryItem {
  status: string;
  reason?: string;
  changedBy?: string;
  changedAt: Date;
}

export interface OrganizationProps {
  id?: string;
  name: string;
  city: string;
  state?: string;
  status: UserStatus;
  studentCountRange?: string;
  shortName?: string;
  yearEstablished?: string;
  address?: string;
  naacGrade?: string;
  placementCellName?: string;
  placementContactEmail?: string;
  placementContactPhone?: string;
  activeBranches?: string[];
  currentAcademicYear?: string;
  activePlacementBatch?: string;
  plan?: string;
  trialEndsAt?: Date;
  logoUrl?: string;
  verificationDocument?: string;
  verificationDocuments?: VerificationDocument[];

  onboardingStep?: number;
  website?: string;
  instituteType?: string;
  description?: string;
  rejectionReason?: string;
  rejectedAt?: Date;
  resubmittedAt?: Date;
  approvedAt?: Date;
  statusHistory?: OrganizationStatusHistoryItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Organization {
  constructor(private _props: OrganizationProps) {}

  static create(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  get id(): string | undefined {
    return this._props.id;
  }
  get name(): string {
    return this._props.name;
  }

  get city(): string {
    return this._props.city;
  }

  get state(): string | undefined {
    return this._props.state;
  }

  get studentCountRange(): string | undefined {
    return this._props.studentCountRange;
  }

  get status(): UserStatus {
    return this._props.status;
  }

  set status(value: UserStatus) {
    this._props.status = value;
  }

  get onboardingStep(): number | undefined {
    return this._props.onboardingStep;
  }

  get instituteType(): string | undefined {
    return this._props.instituteType;
  }

  get activeBranches(): string[] {
    return this._props.activeBranches || [];
  }

  get trialEndsAt(): Date | undefined {
    return this._props.trialEndsAt;
  }

  get plan(): string | undefined {
    return this._props.plan;
  }

  get placementContactPhone(): string | undefined {
    return this._props.placementContactPhone;
  }

  get placementContactEmail(): string | undefined {
    return this._props.placementContactEmail;
  }

  get shortName(): string | undefined {
    return this._props.shortName;
  }

  get yearEstablished(): string | undefined {
    return this._props.yearEstablished;
  }

  get naacGrade(): string | undefined {
    return this._props.naacGrade;
  }

  get placementCellName(): string | undefined {
    return this._props.placementCellName;
  }

  get currentAcademicYear(): string | undefined {
    return this._props.currentAcademicYear;
  }

  get activePlacementBatch(): string | undefined {
    return this._props.activePlacementBatch;
  }

  get logoUrl(): string | undefined {
    return this._props.logoUrl;
  }

  get verificationDocument(): string | undefined {
    return this._props.verificationDocument;
  }

  get verificationDocuments(): VerificationDocument[] | undefined {
    return this._props.verificationDocuments;
  }

  addVerificationDocument(doc: VerificationDocument): void {
    if (!this._props.verificationDocuments) {
      this._props.verificationDocuments = [];
    }
    const existingIndex = this._props.verificationDocuments.findIndex(
      d => d.id === doc.id || (d.fileName === doc.fileName && d.category === doc.category)
    );
    if (existingIndex >= 0) {
      this._props.verificationDocuments[existingIndex] = doc;
    } else {
      this._props.verificationDocuments.push(doc);
    }
    if (!this._props.verificationDocument) {
      this._props.verificationDocument = doc.fileUrl;
    }
  }

  removeVerificationDocument(docId: string): void {
    if (!this._props.verificationDocuments) return;
    this._props.verificationDocuments = this._props.verificationDocuments.filter(d => d.id !== docId);
    if (this._props.verificationDocuments.length > 0) {
      this._props.verificationDocument = this._props.verificationDocuments[0].fileUrl;
    } else {
      this._props.verificationDocument = undefined;
    }
  }

  get rejectionReason(): string | undefined {
    return this._props.rejectionReason;
  }

  get rejectedAt(): Date | undefined {
    return this._props.rejectedAt;
  }

  get resubmittedAt(): Date | undefined {
    return this._props.resubmittedAt;
  }

  get approvedAt(): Date | undefined {
    return this._props.approvedAt;
  }

  get statusHistory(): OrganizationStatusHistoryItem[] {
    return this._props.statusHistory || [];
  }

  get website(): string | undefined {
    return this._props.website;
  }

  get address(): string | undefined {
    return this._props.address;
  }

  get isTrialActive(): boolean {
    if (!this._props.trialEndsAt) return false;
    return new Date() < new Date(this._props.trialEndsAt);
  }

  approve(adminId?: string): void {
    if (this._props.status === UserStatus.REJECTED) {
      throw new Error("Cannot approve a rejected organization without resubmission");
    }
    this._props.status = UserStatus.ACTIVE;
    this._props.approvedAt = new Date();
    this.addStatusHistory(UserStatus.ACTIVE, "Approved by administrator", adminId);
  }

  reject(reason: string, adminId?: string): void {
    if (this._props.status === UserStatus.ACTIVE) {
      throw new Error("Cannot reject an already approved organization");
    }
    if (!reason || !reason.trim()) {
      throw new Error("Rejection reason is required");
    }
    this._props.status = UserStatus.REJECTED;
    this._props.rejectionReason = reason.trim();
    this._props.rejectedAt = new Date();
    this.addStatusHistory(UserStatus.REJECTED, reason.trim(), adminId);
  }

  resubmit(): void {
    if (this._props.status === UserStatus.ACTIVE) {
      throw new Error("Cannot resubmit an already approved organization");
    }
    this._props.status = UserStatus.PENDING;
    this._props.resubmittedAt = new Date();
    this.addStatusHistory(UserStatus.PENDING, "Resubmitted for review");
  }

  private addStatusHistory(status: string, reason?: string, changedBy?: string): void {
    if (!this._props.statusHistory) {
      this._props.statusHistory = [];
    }
    this._props.statusHistory.push({
      status,
      reason,
      changedBy,
      changedAt: new Date()
    });
  }

  toJSON(): OrganizationProps {
     return { ...this._props };
  }
}
