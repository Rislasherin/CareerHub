import { ScoringProfile } from "../types/ats.types";

export const ExperiencedSoftwareEngineerProfile: ScoringProfile = {
    profileId: "EXP_SWE_01",
    description: "Profile for Software Engineers with 2+ years of experience.",
    ruleConfigs: [
        { ruleId: "REQ_LINKEDIN", weight: 5, isCritical: true },
        { ruleId: "HAS_EXPERIENCE", weight: 0, isCritical: true },
        { ruleId: "EXP_DETAIL", weight: 30, isCritical: true },
        { ruleId: "AI_REVIEW", weight: 40, isCritical: false }
    ]
};
