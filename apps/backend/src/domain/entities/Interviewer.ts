import { Role } from "@domain/enums/Roles.enum";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface InterviewerProps {
  id?: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  designation: string;
  specialization: string;
  role: Role;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}

export class Interviewer {
  constructor(private props: InterviewerProps) { }

  static create(props: InterviewerProps): Interviewer {
    return new Interviewer(props);
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

  get specialization(): string {
    return this.props.specialization;
  }

  get role(): Role {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  set status(value: UserStatus) {
    this.props.status = value;
  }

  get isDeleted(): boolean | undefined {
    return this.props.isDeleted;
  }

  toJSON(): InterviewerProps {
    return { ...this.props };
  }
}
