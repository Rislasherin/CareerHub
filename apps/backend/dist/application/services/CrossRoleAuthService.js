"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossRoleAuthService = void 0;
class CrossRoleAuthService {
    constructor(_studentRepo, _hrRepo, _interviewerRepo, _collegeAdminRepo, _superAdminRepo) {
        this._studentRepo = _studentRepo;
        this._hrRepo = _hrRepo;
        this._interviewerRepo = _interviewerRepo;
        this._collegeAdminRepo = _collegeAdminRepo;
        this._superAdminRepo = _superAdminRepo;
    }
    async isEmailInUse(email) {
        const checkEmail = email.toLowerCase().trim();
        // Check Studentse
        const student = await this._studentRepo.findByEmail(checkEmail);
        if (student)
            return { inUse: true, role: "Student", status: student.status };
        // Check HR
        const hr = await this._hrRepo.findByEmail(checkEmail);
        if (hr)
            return { inUse: true, role: "HR", status: hr.status };
        // Check Interviewers
        const interviewer = await this._interviewerRepo.findByEmail(checkEmail);
        if (interviewer)
            return { inUse: true, role: "Interviewer", status: interviewer.status };
        // Check College Admins
        const collegeAdmin = await this._collegeAdminRepo.findByEmail(checkEmail);
        if (collegeAdmin)
            return { inUse: true, role: "College Admin", status: collegeAdmin.status };
        // Check Super Admins
        const superAdmin = await this._superAdminRepo.findByEmail(checkEmail);
        if (superAdmin)
            return { inUse: true, role: "Super Admin", status: superAdmin.status };
        return { inUse: false };
    }
}
exports.CrossRoleAuthService = CrossRoleAuthService;
