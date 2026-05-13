import { UserStatus } from "../enums/user.status.enum";

export interface CompanyProps {
  id?: string;
  name: string;
  industry?: string;
  sector?: string; // mapping for compatibility
  website?: string;
  headquarters?: string;
  location?: string; // mapping for compatibility
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
  createdAt?: Date;
  updatedAt?: Date;
}

export class Company {
  constructor(private props: CompanyProps) {}

  static create(props: CompanyProps): Company {
    return new Company(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get sector(): string | undefined {
    return this.props.sector;
  }

  get size(): string | undefined {
    return this.props.size;
  }

  get location(): string | undefined {
    return this.props.location;
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

  get onboardingStep(): number {
    return this.props.onboardingStep;
  }

  get status(): UserStatus {
    return this.props.status;
  }
  
  set status(value: UserStatus) {
    this.props.status = value;
  }

  toJSON(): CompanyProps {
    return { ...this.props };
  }
}
