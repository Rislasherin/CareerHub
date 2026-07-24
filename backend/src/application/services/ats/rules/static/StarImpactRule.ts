import { Resume } from "@domain/entities/AI/resume.entity";
import { IAtsRule } from "../IAtsRule";
import { RuleResult, RuleStatus, AtsSection } from "../../types/ats.types";

export interface StarImpactMetadata {
    totalBullets: number;
    quantifiedBullets: number;
    actionVerbBullets: number;
}

const ACTION_VERBS = new Set([
  'spearheaded', 'engineered', 'architected', 'optimized', 'built', 'developed', 
  'implemented', 'scaled', 'reduced', 'increased', 'automated', 'designed', 
  'led', 'created', 'accelerated', 'transformed', 'delivered', 'orchestrated',
  'enhanced', 'revamped', 'launched', 'streamlined', 'pioneered', 'migrated'
]);

const METRIC_REGEX = /\b(\d+%\b|\$\d+|\d+x\b|\d+\s*(k|m|b)\b|\b\d+\s*ms\b|\b\d+\s*users\b|\b\d+\s*percent\b|\b\d+\b)/i;

export class StarImpactRule implements IAtsRule {
    public readonly id = 'STAR_IMPACT';
    public readonly category = AtsSection.EXPERIENCE;
    public readonly dependencies = ['HAS_EXPERIENCE'];

    evaluate(resume: Resume): RuleResult<StarImpactMetadata> {
        if (!resume.experience || resume.experience.length === 0) {
            return { ruleId: this.id, status: RuleStatus.SKIPPED, feedback: 'No experience entries to analyze for STAR impact.' };
        }

        let totalBullets = 0;
        let quantifiedBullets = 0;
        let actionVerbBullets = 0;

        resume.experience.forEach(exp => {
            (exp.bulletPoints || []).forEach(bullet => {
                const trimmed = bullet.trim();
                if (!trimmed) return;
                totalBullets++;

                // does it start with a strong action verb?
                const firstWord = trimmed.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
                if (ACTION_VERBS.has(firstWord)) {
                    actionVerbBullets++;
                }

                // does it have a number or metric in it?
                if (METRIC_REGEX.test(trimmed)) {
                    quantifiedBullets++;
                }
            });
        });

        if (totalBullets === 0) {
            return { ruleId: this.id, status: RuleStatus.SKIPPED, feedback: 'No bullet points available in experience section.' };
        }

        const quantifiedRatio = quantifiedBullets / totalBullets;
        const verbRatio = actionVerbBullets / totalBullets;

        let status = RuleStatus.PASS;
        let feedback = 'Strong use of action verbs and quantified impact metrics in bullet points.';

        if (quantifiedRatio < 0.3 || verbRatio < 0.5) {
            status = RuleStatus.WARNING;
            feedback = `Only ${Math.round(quantifiedRatio * 100)}% of bullet points contain metrics. Add quantifiable results (e.g. "Reduced latency by 40%").`;
        }
        if (quantifiedRatio < 0.1 && verbRatio < 0.3) {
            status = RuleStatus.FAIL;
            feedback = 'Bullet points lack strong action verbs and quantified metrics. Use the STAR method to demonstrate measurable impact.';
        }

        return {
            ruleId: this.id,
            status,
            feedback,
            metadata: { totalBullets, quantifiedBullets, actionVerbBullets }
        };
    }
}
