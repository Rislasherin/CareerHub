import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface SuperAdminProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SuperAdmin {
  constructor(private readonly props: SuperAdminProps) {}

  static create(props: SuperAdminProps): SuperAdmin {
    return new SuperAdmin(props);
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

  get role(): Role {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  toJSON(): SuperAdminProps {
    return { ...this.props };
  }
}
