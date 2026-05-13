"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserStatusUseCase = void 0;
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class UpdateUserStatusUseCase {
    constructor(studentRepo, orgRepo, companyRepo, interviewerRepo) {
        this.studentRepo = studentRepo;
        this.orgRepo = orgRepo;
        this.companyRepo = companyRepo;
        this.interviewerRepo = interviewerRepo;
    }
    async execute(role, id, status) {
        switch (role) {
            case Roles_enum_1.Role.STUDENT:
                await this.studentRepo.updateStatus(id, status);
                break;
            case Roles_enum_1.Role.COLLEGE_ADMIN:
                await this.orgRepo.updateStatus(id, status);
                break;
            case Roles_enum_1.Role.HR:
                await this.companyRepo.updateStatus(id, status);
                break;
            case Roles_enum_1.Role.INTERVIEWER:
                await this.interviewerRepo.updateStatus(id, status);
                break;
            default:
                throw new AppError_1.AppError("Invalid role for status update", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
        }
    }
}
exports.UpdateUserStatusUseCase = UpdateUserStatusUseCase;
