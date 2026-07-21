import { IResumeTemplateStrategy } from "../IResumeTemplateStrategy";
import { Resume, IExperience, IProject, IEducation } from "@domain/entities/AI/resume.entity";
import { categorizeSkills, formatLink, ensureHttps } from "../utils/TemplateUtils";

export class ProfessionalTemplate implements IResumeTemplateStrategy {
    public templateId = "professional";

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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            /* Reset & Base */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: 'Inter', -apple-system, sans-serif; 
                color: #111827; 
                line-height: 1.5; 
                background: #fff; 
                font-size: 13.5px;
            }
            .resume-wrapper {
                padding: 40px;
                max-width: 100%;
                margin: 0 auto;
            }
            
            /* Typography */
            h1 { font-size: 30px; font-weight: 700; color: #000; margin-bottom: 4px; letter-spacing: -0.5px; text-transform: uppercase; }
            h2 { font-size: 14.5px; font-weight: 700; color: #000; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
            .section-title-wrapper { border-bottom: 1px solid #d1d5db; margin: 20px 0 12px 0; padding-bottom: 4px; page-break-after: avoid; break-after: avoid; }
            
            p, span, li { color: #374151; }
            a { color: #111827; text-decoration: none; }
            
            /* Header */
            .header { text-align: center; margin-bottom: 20px; }
            .target-role { font-size: 15px; font-weight: 500; color: #4b5563; margin-bottom: 8px; }
            .contact-info { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; font-size: 12.5px; }
            .contact-separator { color: #9ca3af; margin: 0 4px; }
            
            /* Content Blocks */
            .summary { text-align: justify; margin-bottom: 16px; }
            
            .item-block { margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid; }
            .item-block:last-child { margin-bottom: 0; }
            
            .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
            .item-title { font-weight: 700; font-size: 14px; color: #000; }
            .item-subtitle { font-weight: 500; font-size: 13.5px; font-style: italic; color: #111827; }
            .item-date { font-weight: 500; font-size: 12.5px; color: #4b5563; white-space: nowrap; margin-left: 16px; }
            .item-meta { font-size: 12.5px; color: #4b5563; margin-bottom: 6px; }
            
            /* Lists */
            ul.bullets { padding-left: 24px; margin: 6px 0 0 0; }
            ul.bullets li { margin-bottom: 4px; padding-left: 4px; word-break: break-word; overflow-wrap: break-word; }
            ul.bullets li::marker { color: #4b5563; }
            
            /* Skills Grid */
            .skills-list { display: flex; flex-direction: column; gap: 6px; }
            .skill-row { display: flex; font-size: 13.5px; line-height: 1.5; page-break-inside: avoid; break-inside: avoid; }
            .skill-cat { width: 130px; font-weight: 600; color: #111827; flex-shrink: 0; }
            .skill-items { flex: 1; color: #374151; }
        `;
    }

    private renderHeader(resume: Resume): string {
        const contactLinks: string[] = [];
        if (resume.personalInfo?.city) contactLinks.push(`<span>${resume.personalInfo.city}</span>`);
        if (resume.personalInfo?.email) contactLinks.push(`<a href="mailto:${resume.personalInfo.email}">${resume.personalInfo.email}</a>`);
        if (resume.personalInfo?.phone) contactLinks.push(`<span>${resume.personalInfo.phone}</span>`);
        if (resume.personalInfo?.linkedinUrl) contactLinks.push(`<a href="${ensureHttps(resume.personalInfo.linkedinUrl)}">${formatLink(resume.personalInfo.linkedinUrl)}</a>`);
        if (resume.personalInfo?.githubUrl) contactLinks.push(`<a href="${ensureHttps(resume.personalInfo.githubUrl)}">${formatLink(resume.personalInfo.githubUrl)}</a>`);
        if (resume.personalInfo?.portfolioUrl) contactLinks.push(`<a href="${ensureHttps(resume.personalInfo.portfolioUrl)}">${formatLink(resume.personalInfo.portfolioUrl)}</a>`);
        
        return `
            <header class="header">
                <h1>${resume.personalInfo?.fullName || 'Anonymous User'}</h1>
                ${resume.targetRole ? `<div class="target-role">${resume.targetRole}</div>` : ''}
                <div class="contact-info">
                    ${contactLinks.join('<span class="contact-separator">|</span>')}
                </div>
            </header>
        `;
    }

    private renderSummary(resume: Resume): string {
        if (!resume.summary) return '';
        return `
            <div class="section-title-wrapper"><h2>Summary</h2></div>
            <p class="summary">${resume.summary}</p>
        `;
    }

    private renderExperience(resume: Resume): string {
        if (!resume.experience || resume.experience.length === 0) return '';
        const itemsHtml = resume.experience.map((exp: IExperience) => {
            const start = exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : '';
            const end = exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : '');
            const bullets = (exp.bulletPoints || []).filter(b => b.trim() !== '').map(b => `<li>${b.trim()}</li>`).join('');
            
            return `
                <div class="item-block">
                    <div class="item-header">
                        <div class="item-title">${exp.role || ''}</div>
                        <div class="item-date">${start} – ${end}</div>
                    </div>
                    <div class="item-subtitle">${exp.company || ''}${exp.location ? `, ${exp.location}` : ''}</div>
                    ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
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
                    <div class="item-header">
                        <div class="item-title">
                            ${proj.name || ''} 
                            ${proj.link ? `<span style="font-weight: normal; margin-left: 8px;">| <a href="${ensureHttps(proj.link)}" target="_blank" style="text-decoration: underline;">${formatLink(proj.link)}</a></span>` : ''}
                        </div>
                    </div>
                    ${proj.technologies && proj.technologies.length > 0 ? `<div class="item-meta"><strong style="color: #111827;">Tech Stack:</strong> ${proj.technologies.join(', ')}</div>` : ''}
                    ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
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
                <div class="skill-cat">${cat}:</div>
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
                <div class="item-header">
                    <div class="item-title">${ed.institution || ''}</div>
                    <div class="item-date">${ed.graduationYear || ''}</div>
                </div>
                <div class="item-subtitle">
                    ${ed.degree}
                    ${ed.gpa ? `<span style="float: right; font-weight: 500; font-style: normal; color: #4b5563;">CGPA: ${ed.gpa}</span>` : ''}
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
            <ul class="bullets" style="padding-left: 18px; margin: 0;">
                ${resume.certifications.map(c => `<li>${c}</li>`).join('')}
            </ul>
        `;
    }

    private renderAchievements(resume: Resume): string {
        if (!resume.achievements || resume.achievements.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Achievements</h2></div>
            <ul class="bullets" style="padding-left: 18px; margin: 0;">
                ${resume.achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
        `;
    }

    private renderLanguages(resume: Resume): string {
        if (!resume.languages || resume.languages.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Languages</h2></div>
            <p style="margin-bottom: 16px;">${resume.languages.join(', ')}</p>
        `;
    }
}
