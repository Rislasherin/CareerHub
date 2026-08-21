import { Resume } from "@domain/entities/resume.entity";
import { IAtsRule } from "../IAtsRule";
import { RuleResult, RuleStatus, AtsSection } from "../../types/ats.types";

export interface ProjectsMetadata {
    totalProjects: number;
    projectsWithLinks: number;
}

export class HasProjectsRule implements IAtsRule {
    public readonly id = 'HAS_PROJECTS';
    public readonly category = AtsSection.PROJECTS;
    public readonly dependencies = [];

    evaluate(resume: Resume): RuleResult<ProjectsMetadata> {
        const totalProjects = resume.projects ? resume.projects.length : 0;

        if (totalProjects === 0) {
            return {
                ruleId: this.id,
                status: RuleStatus.FAIL,
                feedback: 'No projects listed. Adding 2-3 technical projects with live/GitHub links significantly boosts ATS visibility.',
                metadata: { totalProjects: 0, projectsWithLinks: 0 }
            };
        }

        let projectsWithLinks = 0;
        resume.projects.forEach(p => {
            if (p.link && p.link.trim().length > 0) {
                projectsWithLinks++;
            }
        });

        if (projectsWithLinks === 0) {
            return {
                ruleId: this.id,
                status: RuleStatus.WARNING,
                feedback: `${totalProjects} project(s) listed, but none have live/GitHub demo links. Add links to showcase proof of work.`,
                metadata: { totalProjects, projectsWithLinks }
            };
        }

        return {
            ruleId: this.id,
            status: RuleStatus.PASS,
            feedback: `${totalProjects} project(s) listed with ${projectsWithLinks} project link(s) included.`,
            metadata: { totalProjects, projectsWithLinks }
        };
    }
}
