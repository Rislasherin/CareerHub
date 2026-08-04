import { ScoringProfile } from "../types/ats.types";

export const ExperiencedSoftwareEngineerProfile: ScoringProfile = {
    profileId: "EXP_SWE_01",
    description: "Profile for Software Engineers with 2+ years of experience.",
    ruleConfigs: [
        { ruleId: "REQ_LINKEDIN", weight: 5, isCritical: true },
        { ruleId: "HAS_EXPERIENCE", weight: 0, isCritical: true },
        { ruleId: "EXP_DETAIL", weight: 15, isCritical: true },
        { ruleId: "STAR_IMPACT", weight: 20, isCritical: false },
        { ruleId: "HAS_SKILLS", weight: 10, isCritical: false },
        { ruleId: "HAS_PROJECTS", weight: 10, isCritical: false },
        { ruleId: "AI_REVIEW", weight: 40, isCritical: false }
    ]
};


