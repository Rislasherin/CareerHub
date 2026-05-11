export interface CompanyProps {
  id?: string;
  name: string;
  sector?: string;
  size?: string;
  location?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  onboardingStep: number;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Company {
  constructor(private readonly props: CompanyProps) {}

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

  get status(): "active" | "inactive" {
    return this.props.status;
  }

  toJSON(): CompanyProps {
    return { ...this.props };
  }
}
