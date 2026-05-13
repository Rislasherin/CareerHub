"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class ResetPasswordUseCase {
    constructor(jwtService, bcryptService, studentRepo, hrRepo, interviewerRepo, collegeAdminRepo, superAdminRepo) {
        this.jwtService = jwtService;
        this.bcryptService = bcryptService;
        this.studentRepo = studentRepo;
        this.hrRepo = hrRepo;
        this.interviewerRepo = interviewerRepo;
        this.collegeAdminRepo = collegeAdminRepo;
        this.superAdminRepo = superAdminRepo;
    }
    async execute(token, newPassword) {
        // 1. Verify token
        const decoded = this.jwtService.verifyResetToken(token);
        if (!decoded || !decoded.id || !decoded.role) {
            throw new AppError_1.AppError("Invalid or expired reset token", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.INVALID_TOKEN);
        }
        const { id, role } = decoded;
        const hashedPassword = await this.bcryptService.hash(newPassword);
        // 2. Update password in the correct repository
        let updated = false;
        switch (role) {
            case 'student':
                await this.studentRepo.update(id, { password: hashedPassword });
                updated = true;
                break;
            case 'hr':
                await this.hrRepo.update(id, { password: hashedPassword });
                updated = true;
                break;
            case 'interviewer':
                await this.interviewerRepo.update(id, { password: hashedPassword });
                updated = true;
                break;
            case 'college_admin':
                await this.collegeAdminRepo.update(id, { password: hashedPassword });
                updated = true;
                break;
            case 'super_admin':
                await this.superAdminRepo.update(id, { password: hashedPassword });
                updated = true;
                break;
        }
        if (!updated) {
            throw new AppError_1.AppError("User not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.USER_NOT_FOUND);
        }
    }
}
exports.ResetPasswordUseCase = ResetPasswordUseCase;
