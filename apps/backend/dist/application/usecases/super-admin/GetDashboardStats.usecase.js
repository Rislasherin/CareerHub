"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDashboardStatsUseCase = void 0;
class GetDashboardStatsUseCase {
    constructor(_orgRepository, _studentRepository, _companyRepository, _interviewerRepository) {
        this._orgRepository = _orgRepository;
        this._studentRepository = _studentRepository;
        this._companyRepository = _companyRepository;
        this._interviewerRepository = _interviewerRepository;
    }
    async execute() {
        const [orgCount, studentCount, companyCount, interviewerCount] = await Promise.all([
            // Assuming count is available in model or add count to repository
            // For now I'll use a simple count check if available or just 0
            this._orgRepository.model.countDocuments(),
            this._studentRepository.model.countDocuments(),
            this._companyRepository.model.countDocuments(),
            this._interviewerRepository.model.countDocuments(),
        ]);
        return {
            organizations: orgCount,
            students: studentCount,
            companies: companyCount,
            interviewers: interviewerCount,
        };
    }
}
exports.GetDashboardStatsUseCase = GetDashboardStatsUseCase;
