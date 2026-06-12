"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDashboardStatsUseCase = void 0;
class GetDashboardStatsUseCase {
    constructor(_orgRepository, _studentRepository, _comptypeRepository, _interviewerRepository, _hrUserRepository) {
        this._orgRepository = _orgRepository;
        this._studentRepository = _studentRepository;
        this._comptypeRepository = _comptypeRepository;
        this._interviewerRepository = _interviewerRepository;
        this._hrUserRepository = _hrUserRepository;
    }
    async execute() {
        const [orgCount, studentCount, comptypeCount, interviewerCount] = await Promise.all([
            this._orgRepository.count({}),
            this._studentRepository.count({}),
            this._hrUserRepository.count({}),
            this._interviewerRepository.count({}),
        ]);
        return {
            organizations: orgCount,
            students: studentCount,
            companies: comptypeCount,
            interviewers: interviewerCount,
        };
    }
}
exports.GetDashboardStatsUseCase = GetDashboardStatsUseCase;
