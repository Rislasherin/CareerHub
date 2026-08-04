export enum RuleStatus {
    PASS = "PASS",
    WARNING = "WARNING",
    FAIL = "FAIL",
    SKIPPED = "SKIPPED"
}

export enum AtsSection {
    PERSONAL_INFO = "Personal Information",
    EDUCATION = "Education",
    EXPERIENCE = "Experience",
    PROJECTS = "Projects",
    SKILLS = "Skills",
    FORMATTING = "Formatting",
    AI_ANALYSIS = "AI Analysis"
}

export interface RuleResult<T = any> {
    ruleId: string;
    status: RuleStatus;
    feedback: string;
    metadata?: T;
}

export interface RuleWeightConfig {
    ruleId: string;
    weight: number;
    isCritical: boolean;
}

export interface ScoringProfile {
    profileId: string;
    description: string;
    ruleConfigs: RuleWeightConfig[];
}

export interface AtsReport {
    overallScore: number;
    sectionScores: Record<string, { earned: number; max: number; percentage: number }>;
    criticalIssues: string[];
    warnings: string[];
    improvements: string[];
    strengths: string[];
    aiInsights: string[];
    reportVersion: string;
    generatedAt: Date;
}
