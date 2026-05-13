"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStudentsUseCase = void 0;
class GetStudentsUseCase {
    constructor(_studentRepository) {
        this._studentRepository = _studentRepository;
    }
    async execute(query, page, limit) {
        const { students, total } = await this._studentRepository.searchAllStudents(query, page, limit);
        return {
            students: students.map(s => {
                const json = s.toJSON();
                return {
                    id: json.id,
                    firstName: json.firstName,
                    lastName: json.lastName,
                    email: json.email,
                    status: json.status,
                    collegeId: json.collegeId,
                    createdAt: json.createdAt
                };
            }),
            total,
            page,
            limit
        };
    }
}
exports.GetStudentsUseCase = GetStudentsUseCase;
