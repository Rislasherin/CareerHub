"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCollegeDashboardStatsUseCase = void 0;
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class GetCollegeDashboardStatsUseCase {
    constructor(studentRepository) {
        this.studentRepository = studentRepository;
    }
    async execute(orgId) {
        const [totalStudents, placedStudents, inProcessStudents] = await Promise.all([
            this.studentRepository.count({ collegeId: orgId }),
            this.studentRepository.count({ collegeId: orgId, status: user_status_enum_1.UserStatus.PLACED }),
            this.studentRepository.count({ collegeId: orgId, status: user_status_enum_1.UserStatus.IN_PROCESS }),
        ]);
        // Dummy values for others as requested
        return {
            totalStudents,
            placedStudents,
            inProcessStudents,
            highestPackage: "₹24L", // Static as per request
            recentPlacements: [], // Can be filled if needed
            stats: {
                placementRate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0,
            }
        };
    }
}
exports.GetCollegeDashboardStatsUseCase = GetCollegeDashboardStatsUseCase;
