"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserUseCase = void 0;
const Roles_enum_1 = require("@domain/enums/Roles.enum");
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
class DeleteUserUseCase {
    constructor(studentRepo, orgRepo, comptypeRepo, interviewerRepo, hrRepo) {
        this.studentRepo = studentRepo;
        this.orgRepo = orgRepo;
        this.comptypeRepo = comptypeRepo;
        this.interviewerRepo = interviewerRepo;
        this.hrRepo = hrRepo;
    }
    async execute(role, id) {
        switch (role) {
            case Roles_enum_1.Role.STUDENT:
                await this.studentRepo.delete(id);
                break;
            case Roles_enum_1.Role.COLLEGE_ADMIN:
                await this.orgRepo.delete(id);
                break;
            case Roles_enum_1.Role.HR:
                await this.hrRepo.delete(id);
                break;
            case Roles_enum_1.Role.INTERVIEWER:
                await this.interviewerRepo.delete(id);
                break;
            default:
                throw new AppError_1.AppError("Invalid role for deletion", HttpStatus_enum_1.HttpStatus.BAD_REQUEST, ErrorCodes_enum_1.ErrorCode.VALIDATION_ERROR);
        }
    }
}
exports.DeleteUserUseCase = DeleteUserUseCase;
