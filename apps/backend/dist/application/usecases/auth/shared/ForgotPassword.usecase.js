"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordUseCase = void 0;
const env_validator_1 = require("@infrastructure/config/env.validator");
class ForgotPasswordUseCase {
    constructor(emailService, jwtService, studentRepo, hrRepo, interviewerRepo, collegeAdminRepo, superAdminRepo) {
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.studentRepo = studentRepo;
        this.hrRepo = hrRepo;
        this.interviewerRepo = interviewerRepo;
        this.collegeAdminRepo = collegeAdminRepo;
        this.superAdminRepo = superAdminRepo;
    }
    async execute(email) {
        // 1. Find user in any of the repositories
        let user = null;
        let role = '';
        user = await this.studentRepo.findByEmail(email);
        if (user)
            role = 'student';
        if (!user) {
            user = await this.hrRepo.findByEmail(email);
            if (user)
                role = 'hr';
        }
        if (!user) {
            user = await this.interviewerRepo.findByEmail(email);
            if (user)
                role = 'interviewer';
        }
        if (!user) {
            user = await this.collegeAdminRepo.findByEmail(email);
            if (user)
                role = 'college_admin';
        }
        if (!user) {
            user = await this.superAdminRepo.findByEmail(email);
            if (user)
                role = 'super_admin';
        }
        // 2. If user doesn't exist, we still return success to prevent email enumeration
        if (!user)
            return;
        // 3. Generate a reset token (short-lived)
        const resetToken = this.jwtService.generateResetToken({
            id: user.id || user._id,
            email: user.email,
            role
        });
        // 4. Create reset link
        const resetLink = `${env_validator_1.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        // 5. Send email
        await this.emailService.sendPasswordResetEmail(email, resetLink);
    }
}
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
