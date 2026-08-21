import { IResumeTemplateStrategy } from "../IResumeTemplateStrategy";
import { Resume, IExperience, IProject, IEducation } from "@domain/entities/resume.entity";
import { categorizeSkills, formatLink, ensureHttps } from "../utils/TemplateUtils";

export class MinimalTemplate implements IResumeTemplateStrategy {
    public templateId = "minimal";

    generateHtml(resume: Resume, visibilityMap?: Record<string, boolean>): string {
        const categorizedSkills = categorizeSkills(resume.skills || []);

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    ${this.getCss()}
                </style>
            </head>
            <body>
                <div class="resume-wrapper">
                    ${this.renderHeader(resume)}
                    ${this.renderSummary(resume)}
                    ${this.renderExperience(resume)}
                    ${this.renderProjects(resume)}
                    ${this.renderSkills(categorizedSkills)}
                    ${this.renderEducation(resume)}
                    ${this.renderCertifications(resume)}
                    ${this.renderAchievements(resume)}
                    ${this.renderLanguages(resume)}
                </div>
            </body>
            </html>
        `;
    }

    private getCss(): string {
        return `
            @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
            
            /* Reset & Base */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: 'Fira Sans', sans-serif; 
                color: #2d3748; 
                line-height: 1.6; 
                background: #fff; 
                font-size: 13.5px;
            }
            .resume-wrapper {
                padding: 48px 56px;
                max-width: 100%;
                margin: 0 auto;
            }
            
            /* Typography */
            h1 { font-size: 32px; font-weight: 600; color: #1a202c; margin-bottom: 4px; letter-spacing: -0.5px; text-transform: capitalize; }
            h2 { font-size: 12px; font-weight: 600; color: #a0aec0; text-transform: uppercase; letter-spacing: 2px; margin: 0; flex-shrink: 0; }
            .section-title-wrapper { margin: 32px 0 16px 0; display: flex; align-items: center; page-break-after: avoid; break-after: avoid; }
            .section-title-wrapper::after { content: ""; flex: 1; margin-left: 16px; height: 1px; background-color: #e2e8f0; }
            
            p, span, li { color: #4a5568; }
            a { color: inherit; text-decoration: none; border-bottom: 1px solid #cbd5e0; }
            a:hover { color: #2d3748; border-color: #2d3748; }
            
            /* Header */
            .header { margin-bottom: 8px; }
            .target-role { font-size: 15px; font-weight: 500; color: #718096; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .contact-info { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: #718096; }
            
            /* Content Blocks */
            .summary { text-align: justify; margin-bottom: 16px; }
            
            .item-block { margin-bottom: 24px; display: flex; gap: 24px; page-break-inside: avoid; break-inside: avoid; }
            .item-block:last-child { margin-bottom: 0; }
            
            .item-left { width: 140px; flex-shrink: 0; word-break: break-word; overflow-wrap: break-word; }
            .item-right { flex: 1; min-width: 0; word-break: break-word; overflow-wrap: break-word; }
            
            .item-date { font-size: 12.5px; color: #718096; font-weight: 500; margin: 0; }
            .item-title { font-weight: 600; font-size: 14.5px; color: #2d3748; margin: 0 0 2px 0; }
            .item-subtitle { font-size: 13.5px; color: #4a5568; font-style: italic; margin: 0 0 8px 0; }
            .item-meta { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
            
            /* Lists */
            ul.bullets { padding-left: 16px; margin: 0; font-size: 13.5px; }
            ul.bullets li { margin-bottom: 4px; padding-left: 4px; }
            
            /* Skills */
            .skills-list { display: flex; flex-direction: column; gap: 8px; }
            .skill-row { display: flex; gap: 24px; font-size: 13.5px; line-height: 1.6; page-break-inside: avoid; break-inside: avoid; }
            .skill-cat { width: 140px; font-weight: 600; color: #718096; flex-shrink: 0; }
            .skill-items { flex: 1; }
        `;
    }

    private renderHeader(resume: Resume): string {
        const contactLinks: string[] = [];
        if (resume.personalInfo?.city) contactLinks.push(`<span>${resume.personalInfo.city}</span>`);
        if (resume.personalInfo?.email) contactLinks.push(`<a href="mailto:${resume.personalInfo.email}">${resume.personalInfo.email}</a>`);
        if (resume.personalInfo?.phone) contactLinks.push(`<span>${resume.personalInfo.phone}</span>`);
        if (resume.personalInfo?.linkedinUrl) contactLinks.push(`<a href="${ensureHttps(resume.personalInfo.linkedinUrl)}" target="_blank">${formatLink(resume.personalInfo.linkedinUrl)}</a>`);
        if (resume.personalInfo?.githubUrl) contactLinks.push(`<a href="${ensureHttps(resume.personalInfo.githubUrl)}" target="_blank">${formatLink(resume.personalInfo.githubUrl)}</a>`);
        if (resume.personalInfo?.portfolioUrl) contactLinks.push(`<a href="${ensureHttps(resume.personalInfo.portfolioUrl)}" target="_blank">${formatLink(resume.personalInfo.portfolioUrl)}</a>`);

        return `
            <header class="header">
                <h1>${resume.personalInfo?.fullName || 'Anonymous User'}</h1>
                ${resume.targetRole ? `<div class="target-role">${resume.targetRole}</div>` : ''}
                <div class="contact-info">
                    ${contactLinks.join('')}
                </div>
            </header>
        `;
    }

    private renderSummary(resume: Resume): string {
        if (!resume.summary) return '';
        return `
            <div class="section-title-wrapper"><h2>Summary</h2></div>
            <div class="item-block">
                <div class="item-left"></div>
                <div class="item-right">
                    <p class="summary">${resume.summary}</p>
                </div>
            </div>
        `;
    }

    private renderExperience(resume: Resume): string {
        if (!resume.experience || resume.experience.length === 0) return '';
        const itemsHtml = resume.experience.map((exp: IExperience) => {
            const start = exp.startDate ? new Date(exp.startDate).getFullYear() : '';
            const end = exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '');
            const bullets = (exp.bulletPoints || []).filter(b => b.trim() !== '').map(b => `<li>${b.trim()}</li>`).join('');

            return `
                <div class="item-block">
                    <div class="item-left">
                        <p class="item-date">${start} – ${end}</p>
                    </div>
                    <div class="item-right">
                        <p class="item-title">${exp.role || ''}</p>
                        <p class="item-subtitle">${exp.company || ''}${exp.location ? ` - ${exp.location}` : ''}</p>
                        ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="section-title-wrapper"><h2>Experience</h2></div>
            ${itemsHtml}
        `;
    }

    private renderProjects(resume: Resume): string {
        if (!resume.projects || resume.projects.length === 0) return '';
        const itemsHtml = resume.projects.map((proj: IProject) => {
            const bullets = (proj.description || '').split('\n').filter(b => b.trim() !== '').map(b => `<li>${b.trim()}</li>`).join('');
            return `
                <div class="item-block">
                    <div class="item-left">
                        ${proj.link ? `<p class="item-date"><a href="${ensureHttps(proj.link)}" target="_blank">${formatLink(proj.link)}</a></p>` : ''}
                    </div>
                    <div class="item-right">
                        <p class="item-title">${proj.name || ''}</p>
                        ${proj.technologies && proj.technologies.length > 0 ? `<p class="item-meta">${proj.technologies.join(' • ')}</p>` : ''}
                        ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="section-title-wrapper"><h2>Projects</h2></div>
            ${itemsHtml}
        `;
    }

    private renderSkills(categorizedSkills: Record<string, string[]>): string {
        const validCategories = Object.entries(categorizedSkills).filter(([_, items]) => items.length > 0);
        if (validCategories.length === 0) return '';

        const skillsHtml = validCategories.map(([cat, items]) => `
            <div class="skill-row">
                <div class="skill-cat">${cat}</div>
                <div class="skill-items">${items.join(', ')}</div>
            </div>
        `).join('');

        return `
            <div class="section-title-wrapper"><h2>Skills</h2></div>
            <div class="skills-list">${skillsHtml}</div>
        `;
    }

    private renderEducation(resume: Resume): string {
        if (!resume.education || resume.education.length === 0) return '';
        const itemsHtml = resume.education.map((ed: IEducation) => `
            <div class="item-block">
                <div class="item-left">
                    <p class="item-date">${ed.graduationYear || ''}</p>
                </div>
                <div class="item-right">
                    <p class="item-title">${ed.degree}</p>
                    <p class="item-subtitle">${ed.institution || ''}</p>
                    ${ed.gpa ? `<p class="item-meta">GPA: ${ed.gpa}</p>` : ''}
                </div>
            </div>
        `).join('');

        return `
            <div class="section-title-wrapper"><h2>Education</h2></div>
            ${itemsHtml}
        `;
    }

    private renderCertifications(resume: Resume): string {
        if (!resume.certifications || resume.certifications.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Certifications</h2></div>
            <div class="skills-list">
                <div class="skill-row">
                    <div class="skill-cat">Licenses</div>
                    <div class="skill-items">${resume.certifications.join('<br>')}</div>
                </div>
            </div>
        `;
    }

    private renderAchievements(resume: Resume): string {
        if (!resume.achievements || resume.achievements.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Achievements</h2></div>
            <div class="item-block">
                <div class="item-left"></div>
                <div class="item-right">
                    <ul class="bullets">
                        ${resume.achievements.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    private renderLanguages(resume: Resume): string {
        if (!resume.languages || resume.languages.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Languages</h2></div>
            <div class="skills-list">
                <div class="skill-row">
                    <div class="skill-cat">Languages</div>
                    <div class="skill-items">${resume.languages.join(', ')}</div>
                </div>
            </div>
        `;
    }
}
