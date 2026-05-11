"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentSetPasswordUseCase = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const role_enum_1 = require("@domain/enums/role.enum");
const message_constants_1 = require("@shared/constants/message.constants");
class StudentSetPasswordUseCase {
    constructor(studentRepository, hashService) {
        this.studentRepository = studentRepository;
        this.hashService = hashService;
    }
    async execute(accountId, dto) {
        const account = await this.studentRepository.findById(accountId);
        if (!account || account.getRole() !== role_enum_1.Role.STUDENT) {
            throw new auth_error_1.UnauthorizedError();
        }
        if (!account.isFirstLogin()) {
            throw new auth_error_1.ForbiddenError(message_constants_1.MESSAGE_CONSTANTS.AUTH.FIRST_LOGIN_ONLY);
        }
        account.setPasswordHash(await this.hashService.hash(dto.password));
        account.completeFirstLogin();
        account.clearResetToken();
        await this.studentRepository.save(account);
    }
}
exports.StudentSetPasswordUseCase = StudentSetPasswordUseCase;
