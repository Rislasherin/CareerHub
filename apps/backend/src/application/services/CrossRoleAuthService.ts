import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { ISuperAdminRepository } from "@domain/repositories/ISuperAdminRepository";

export class CrossRoleAuthService {
  constructor(
    private readonly _studentRepo: IStudentRepository,
    private readonly _hrRepo: IHRUserRepository,
    private readonly _interviewerRepo: IInterviewerRepository,
    private readonly _collegeAdminRepo: ICollegeAdminRepository,
    private readonly _superAdminRepo: ISuperAdminRepository
  ) {}

  async isEmailInUse(email: string): Promise<{ inUse: boolean; role?: string }> {
    const checkEmail = email.toLowerCase().trim();

    // Check Students
    const student = await this._studentRepo.findByEmail(checkEmail);
    if (student) return { inUse: true, role: "Student" };

    // Check HR
    const hr = await this._hrRepo.findByEmail(checkEmail);
    if (hr) return { inUse: true, role: "HR" };

    // Check Interviewers
    const interviewer = await this._interviewerRepo.findByEmail(checkEmail);
    if (interviewer) return { inUse: true, role: "Interviewer" };

    // Check College Admins
    const collegeAdmin = await this._collegeAdminRepo.findByEmail(checkEmail);
    if (collegeAdmin) return { inUse: true, role: "College Admin" };

    // Check Super Admins
    const superAdmin = await this._superAdminRepo.findByEmail(checkEmail);
    if (superAdmin) return { inUse: true, role: "Super Admin" };

    return { inUse: false };
  }
}
