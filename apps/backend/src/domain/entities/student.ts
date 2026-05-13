import { UserStatus } from "@domain/enums/user.status.enum";

export interface StudentProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: UserStatus;
  collegeId: string;
  proofUrl?: string;
  isFirstLogin: boolean;
  rollNumber?: string;
  department?: string;
  phoneNumber?: string;
  rejectReason?: string;
  invitationToken?: string;
  invitationExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Student {
  constructor(private readonly _props: StudentProps) {}

  static create(props: StudentProps): Student {
    return new Student(props);
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

  get status(): UserStatus {
    return this._props.status;
  }

  get collegeId(): string {
    return this._props.collegeId;
  }

  get proofUrl(): string | undefined {
    return this._props.proofUrl;
  }

  get isFirstLogin(): boolean {
    return this._props.isFirstLogin;
  }

  get rollNumber(): string | undefined {
    return this._props.rollNumber;
  }

  get department(): string | undefined {
    return this._props.department;
  }

  get phoneNumber(): string | undefined {
    return this._props.phoneNumber;
  }

  get rejectReason(): string | undefined {
    return this._props.rejectReason;
  }

  get invitationToken(): string | undefined {
    return this._props.invitationToken;
  }

  get invitationExpiresAt(): Date | undefined {
    return this._props.invitationExpiresAt;
  }

  toJSON(): StudentProps {
    return { ...this._props };
  }
}
