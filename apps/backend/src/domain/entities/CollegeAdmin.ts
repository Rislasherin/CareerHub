import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface CollegeAdminProps {
  id?: string;

  firstName: string;
  lastName: string;

  email: string;
  password: string;

  orgId: string;

  role: Role;
  status: UserStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export class CollegeAdmin {
  constructor(private readonly props: CollegeAdminProps) {}

  static create(props: CollegeAdminProps): CollegeAdmin {
    return new CollegeAdmin(props);
  }

  get id(): string | undefined {
    return this.props.id;
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

  get orgId(): string {
    return this.props.orgId;
  }

  get role(): Role {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  toJSON(): CollegeAdminProps {
    return { ...this.props };
  }
}