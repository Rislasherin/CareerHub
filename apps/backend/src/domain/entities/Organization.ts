import { UserStatus } from "@domain/enums/user.status.enum";

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
  logoUrl?: string;
  onboardingStep?: number;
  website?: string;
  description?: string;
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

  toJSON():OrganizationProps {
     return {...this._props};
  }
}
