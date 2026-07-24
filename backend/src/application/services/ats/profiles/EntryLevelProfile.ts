import { ScoringProfile } from "../types/ats.types";

export const EntryLevelStudentProfile: ScoringProfile = {
    profileId: "ENTRY_STUDENT_01",
    description: "Tailored ATS Scoring Profile for Students & Fresh Graduates.",
    ruleConfigs: [
        { ruleId: "REQ_LINKEDIN", weight: 10, isCritical: false },
        { ruleId: "HAS_EXPERIENCE", weight: 15, isCritical: false },
        { ruleId: "EXP_DETAIL", weight: 10, isCritical: false },
        { ruleId: "HAS_SKILLS", weight: 20, isCritical: true },
        { ruleId: "HAS_PROJECTS", weight: 20, isCritical: true },
        { ruleId: "STAR_IMPACT", weight: 15, isCritical: false },
        { ruleId: "AI_REVIEW", weight: 10, isCritical: false }
    ]
};
