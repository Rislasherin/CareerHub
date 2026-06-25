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
  constructor(private readonly _props: SuperAdminProps) {}

  static create(props: SuperAdminProps): SuperAdmin {
    return new SuperAdmin(props);
  }

  get id(): string | undefined {
    return this._props.id;
  }

  get firstName(): string {
    return this._props.firstName;
  }

  get lastName(): string {
    return this._props.lastName;
  }

  get email(): string {
    return this._props.email;
  }

  get password(): string {
    return this._props.password;
  }

  get role(): Role {
    return this._props.role;
  }

  get status(): UserStatus {
    return this._props.status;
  }

  toJSON(): SuperAdminProps {
    return { ...this._props };
  }
}
