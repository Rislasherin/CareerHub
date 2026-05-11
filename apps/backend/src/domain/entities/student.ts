import { UserStatus } from "@domain/enums/user.status.enum";

export interface StudentProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: UserStatus;
  collegeId: string;
  proofUrl: string;
  isFirstLogin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Student {
  constructor(private readonly props: StudentProps) {}

  static create(props: StudentProps): Student {
    return new Student(props);
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

  get status(): UserStatus {
    return this.props.status;
  }

  get collegeId(): string {
    return this.props.collegeId;
  }

  get proofUrl(): string {
    return this.props.proofUrl;
  }

  get isFirstLogin(): boolean {
    return this.props.isFirstLogin;
  }

  toJSON(): StudentProps {
    return { ...this.props };
  }
}
