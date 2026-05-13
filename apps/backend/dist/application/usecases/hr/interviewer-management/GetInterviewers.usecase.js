"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewersUseCase = void 0;
class GetInterviewersUseCase {
    constructor(_interviewerRepository) {
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(companyId, query, page, limit) {
        const { interviewers, total } = await this._interviewerRepository.searchInterviewers(companyId, query, page, limit);
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
                };
            }),
            total,
            page,
            limit,
        };
    }
}
exports.GetInterviewersUseCase = GetInterviewersUseCase;
