"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPendingStudentsUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class GetPendingStudentsUseCase {
    constructor(_studentRepository) {
        this._studentRepository = _studentRepository;
    }
    async execute(orgId, status) {
        const queryStatus = status || user_status_enum_1.UserStatus.PENDING_VERIFICATION;
        const students = await this._studentRepository.findByOrgIdAndStatus(orgId, queryStatus);
        return students.map((student) => {
            const json = student.toJSON();
            return {
                id: json.id,
                firstName: json.firstName,
                lastName: json.lastName,
                email: json.email,
                proofUrl: json.proofUrl,
                status: json.status,
                createdAt: json.createdAt
            };
        });
    }
}
exports.GetPendingStudentsUseCase = GetPendingStudentsUseCase;
