import { Resume } from "@domain/entities/AI/resume.entity";
import { IAtsRule } from "./rules/IAtsRule";
import { AtsReport, RuleStatus, ScoringProfile } from "./types/ats.types";

export class AtsEngine {
    private rules = new Map<string, IAtsRule>();

    constructor(rulesList: IAtsRule[]) {
        rulesList.forEach(rule => this.rules.set(rule.id, rule));
    }

    public async evaluate(resume: Resume, profile: ScoringProfile): Promise<AtsReport> {
        let maxScore = 0;
        let earnedScore = 0;
        
        const report: AtsReport = {
            overallScore: 0,
            sectionScores: {},
            criticalIssues: [],
            warnings: [],
            improvements: [],
            strengths: [],
            aiInsights: [],
            reportVersion: "2.0.0",
            generatedAt: new Date()
        };

        const ruleResults = new Map<string, RuleStatus>();

        for (const config of profile.ruleConfigs) {
            const rule = this.rules.get(config.ruleId);
            if (!rule) continue;

            const dependenciesMet = rule.dependencies.every(depId => {
                const depStatus = ruleResults.get(depId);
                return depStatus === RuleStatus.PASS || depStatus === RuleStatus.WARNING;
            });

            if (!dependenciesMet && rule.dependencies.length > 0) {
                ruleResults.set(rule.id, RuleStatus.SKIPPED);
                continue;
            }

            const result = await rule.evaluate(resume);
            ruleResults.set(rule.id, result.status);

            if (result.status === RuleStatus.SKIPPED) continue;

            if (!report.sectionScores[rule.category]) {
                report.sectionScores[rule.category] = { earned: 0, max: 0, percentage: 0 };
            }

            report.sectionScores[rule.category].max += config.weight;
            maxScore += config.weight;

            if (result.status === RuleStatus.PASS) {
                earnedScore += config.weight;
                report.sectionScores[rule.category].earned += config.weight;
                report.strengths.push(`[${rule.category}] ${result.feedback}`);
            } else if (result.status === RuleStatus.WARNING) {
                const partialPoints = config.weight / 2;
                earnedScore += partialPoints;
                report.sectionScores[rule.category].earned += partialPoints;
                
                report.warnings.push(`[${rule.category}] ${result.feedback}`);
                report.improvements.push(`[${rule.category}] ${result.feedback}`);
            } else if (result.status === RuleStatus.FAIL) {
                if (config.isCritical) {
                    report.criticalIssues.push(`[${rule.category}] ${result.feedback}`);
                } else {
                    report.improvements.push(`[${rule.category}] ${result.feedback}`);
                }
            }
        }

        report.overallScore = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;
        
        Object.keys(report.sectionScores).forEach(key => {
            const section = report.sectionScores[key];
            section.percentage = section.max > 0 ? Math.round((section.earned / section.max) * 100) : 0;
        });

        return report;
    }
}
