import { UserStatus } from "@domain/enums/user.status.enum";

export interface OrganizationProps {
  id?: string;
  name: string;
  city: string;
  state: string;
  studentCountRange: string;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Organization {
  constructor(private readonly props: OrganizationProps) {}

  static create(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get studentCountRange(): string {
    return this.props.studentCountRange;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  toJSON():OrganizationProps {
     return {...this.props};
  }
}
