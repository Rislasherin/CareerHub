import { IResumeTemplateStrategy } from "./IResumeTemplateStrategy";
import { Resume } from "@domain/entities/resume.entity";
import { ProfessionalTemplate } from "./strategies/ProfessionalTemplate";
import { ModernTemplate } from "./strategies/ModernTemplate";
import { CrimsonTemplate } from "./strategies/CrimsonTemplate";
import { MinimalTemplate } from "./strategies/MinimalTemplate";
import { ExecutiveTemplate } from "./strategies/ExecutiveTemplate";

export class ResumeTemplateContext {
    private strategies = new Map<string, IResumeTemplateStrategy>();

    constructor() {
        this.register(new ProfessionalTemplate());
        this.register(new ModernTemplate());
        this.register(new CrimsonTemplate());
        this.register(new MinimalTemplate());
        this.register(new ExecutiveTemplate());
    }

    private register(strategy: IResumeTemplateStrategy) {
        this.strategies.set(strategy.templateId, strategy);
    }

    public generateHtml(templateId: string, resume: Resume, visibilityMap?: Record<string, boolean>): string {
        const strategy = this.strategies.get(templateId);
        if (!strategy) {
            return this.strategies.get("professional")!.generateHtml(resume, visibilityMap);
        }
        return strategy.generateHtml(resume, visibilityMap);
    }
}
