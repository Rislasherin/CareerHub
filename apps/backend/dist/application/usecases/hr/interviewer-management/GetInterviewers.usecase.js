"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewersUseCase = void 0;
class GetInterviewersUseCase {
    constructor(_interviewerRepository) {
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(comptypeId, query, page, limit, includeDeleted = false) {
        const { interviewers, total } = await this._interviewerRepository.searchInterviewers(comptypeId, query, page, limit, includeDeleted);
        return {
            interviewers: interviewers.map((i) => {
                const json = i.toJSON();
                return {
                    id: json.id,
                    firstName: json.firstName,
                    lastName: json.lastName,
                    email: json.email,
                    designation: json.designation,
                    status: json.status,
                    createdAt: json.createdAt,
                    isDeleted: json.isDeleted || false,
                };
            }),
            total,
            page,
            limit,
        };
    }
}
exports.GetInterviewersUseCase = GetInterviewersUseCase;
