import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface HRUserProps {
  id?: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  designation: string;
  role: Role;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class HRUser {
  constructor(private readonly props: HRUserProps) {}

  static create(props: HRUserProps): HRUser {
    return new HRUser(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get designation(): string {
    return this.props.designation;
  }

  get role(): Role {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  toJSON(): HRUserProps {
    return { ...this.props };
  }
}
