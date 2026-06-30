import { UserStatus } from "@domain/enums/user.status.enum";

export interface StudentExperience {
  company: string;
  role: string;
  duration: string;
  location?: string;
  summary?: string;
}

export interface StudentPreferences {
  preferredRole?: string;
  workMode?: string;
  location?: string;
  expectedCtc?: string;
  noticePeriod?: string;
  jobType?: string;
  startDate?: string;
}
export interface StudentSpokenLanguage {
  language: string;
  proficiency: string;
}
export interface StudentAchievement {
  title: string;
  subtitle?: string;
  type: 'award' | 'certification' | 'coding' | 'other';
}
export interface StudentProject {
  name: string;
  techStack: string[];
  github?: string;
  liveDemo?: string;
  description?: string;
}

export interface StudentSkills {
  languages?: string[];
  frameworks?: string[];
  databases?: string[];
  cloudDevops?: string[];
  otherTools?: string[];
  aiMl?: string[];
}

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

  // Day 12 Student Profile props
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  city?: string;

  // Academic (Locked)
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  activeBacklogs?: number;

  // Complex sub-arrays
  skills?: StudentSkills;
  experience?: StudentExperience[];
  projects?: StudentProject[];
  appliedJobs?: string[];
  resumeScore?: number;
  resumeUrl?: string;
  preferences?: StudentPreferences;
  softSkills?: string[];
  spokenLanguages?: StudentSpokenLanguage[];
  achievements?: StudentAchievement[];
}

export class Student {
  constructor(private readonly _props: StudentProps) { }

  static create(props: StudentProps): Student {
    return new Student(props);
  }

  get id(): string | undefined {
    return this._props.id;
  }

  get resumeScore(): number | undefined { return this._props.resumeScore; }
  get resumeUrl(): string | undefined { return this._props.resumeUrl; }
  get preferences(): StudentPreferences | undefined { return this._props.preferences; }
  get softSkills(): string[] | undefined { return this._props.softSkills; }
  get spokenLanguages(): StudentSpokenLanguage[] | undefined { return this._props.spokenLanguages; }
  get achievements(): StudentAchievement[] | undefined { return this._props.achievements; }

  get appliedJobs(): string[] {
    return this._props.appliedJobs || [];
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

  // Profile get accessors
  get linkedinUrl(): string | undefined {
    return this._props.linkedinUrl;
  }

  get githubUrl(): string | undefined {
    return this._props.githubUrl;
  }

  get portfolioUrl(): string | undefined {
    return this._props.portfolioUrl;
  }

  get city(): string | undefined {
    return this._props.city;
  }

  get degree(): string | undefined {
    return this._props.degree;
  }

  get branch(): string | undefined {
    return this._props.branch;
  }

  get graduationYear(): number | undefined {
    return this._props.graduationYear;
  }

  get cgpa(): number | undefined {
    return this._props.cgpa;
  }

  get tenthPercentage(): number | undefined {
    return this._props.tenthPercentage;
  }

  get twelfthPercentage(): number | undefined {
    return this._props.twelfthPercentage;
  }

  get activeBacklogs(): number | undefined {
    return this._props.activeBacklogs;
  }

  get skills(): StudentSkills | undefined {
    return this._props.skills;
  }

  get experience(): StudentExperience[] | undefined {
    return this._props.experience;
  }

  get projects(): StudentProject[] | undefined {
    return this._props.projects;
  }

  get createdAt(): Date | undefined {
    return this._props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._props.updatedAt;
  }

  toJSON(): StudentProps {
    return { ...this._props };
  }
}
