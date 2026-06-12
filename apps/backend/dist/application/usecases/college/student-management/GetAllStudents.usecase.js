"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllStudentsUseCase = void 0;
class GetAllStudentsUseCase {
    constructor(studentRepository) {
        this.studentRepository = studentRepository;
    }
    async execute(orgId, query = "", page = 1, limit = 10) {
        const result = await this.studentRepository.searchAllStudents(query, page, limit, orgId);
        return result;
    }
}
exports.GetAllStudentsUseCase = GetAllStudentsUseCase;
