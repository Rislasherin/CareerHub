"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewersUseCase = void 0;
class GetInterviewersUseCase {
    constructor(_interviewerRepository) {
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(query, page, limit) {
        const { interviewers, total } = await this._interviewerRepository.searchAllInterviewers(query, page, limit);
        return {
            interviewers: interviewers.map(i => {
                const json = i.toJSON();
                return {
                    id: json.id,
                    firstName: json.firstName,
                    lastName: json.lastName,
                    email: json.email,
                    status: json.status,
                    comptypeId: json.comptypeId,
                    createdAt: json.createdAt
                };
            }),
            total,
            page,
            limit
        };
    }
}
exports.GetInterviewersUseCase = GetInterviewersUseCase;
