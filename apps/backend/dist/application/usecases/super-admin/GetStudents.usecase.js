"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStudentsUseCase = void 0;
class GetStudentsUseCase {
    constructor(_studentRepository, _orgRepository) {
        this._studentRepository = _studentRepository;
        this._orgRepository = _orgRepository;
    }
    async execute(query, page, limit) {
        const { students, total } = await this._studentRepository.searchAllStudents(query, page, limit);
        const enrichedStudents = await Promise.all(students.map(async (s) => {
            const json = s.toJSON();
            const college = await this._orgRepository.findById(json.collegeId);
            return {
                id: json.id,
                firstName: json.firstName,
                lastName: json.lastName,
                email: json.email,
                status: json.status,
                collegeId: json.collegeId,
                collegeName: college?.name || 'N/A',
                branch: json.department || 'N/A',
                department: json.department || 'N/A',
                createdAt: json.createdAt
            };
        }));
        return {
            students: enrichedStudents,
            total,
            page,
            limit
        };
    }
}
exports.GetStudentsUseCase = GetStudentsUseCase;
