import { IResumeTemplateStrategy } from "../IResumeTemplateStrategy";
import { Resume, IExperience, IProject, IEducation } from "@domain/entities/AI/resume.entity";
import { categorizeSkills, formatLink, ensureHttps } from "../utils/TemplateUtils";

export class ExecutiveTemplate implements IResumeTemplateStrategy {
    public templateId = "executive";

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
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Open+Sans:wght@400;600;700&display=swap');
            
            /* Reset & Base */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: 'Open Sans', sans-serif; 
                color: #111; 
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
            h1 { font-family: 'Merriweather', serif; font-size: 34px; font-weight: 700; color: #111; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; }
            h2 { font-family: 'Merriweather', serif; font-size: 15px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; }
            .section-title-wrapper { border-bottom: 2px solid #ccc; margin: 24px 0 16px 0; padding-bottom: 4px; page-break-after: avoid; break-after: avoid; }
            
            p, span, li { color: #333; }
            a { color: inherit; text-decoration: none; }
            a:hover { text-decoration: underline; }
            
            /* Header */
            .header { text-align: center; border-bottom: 1px solid #111; padding-bottom: 20px; margin-bottom: 24px; }
            .target-role { font-family: 'Merriweather', serif; font-size: 16px; font-weight: 400; font-style: italic; color: #444; margin-bottom: 12px; }
            .contact-info { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; font-size: 12.5px; text-transform: uppercase; letter-spacing: 1px; color: #444; }
            .contact-separator { color: #ccc; margin: 0 6px; }
            
            /* Content Blocks */
            .summary { text-align: justify; margin-bottom: 16px; line-height: 1.7; }
            
            .item-block { margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
            .item-block:last-child { margin-bottom: 0; }
            
            .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
            .item-title { font-weight: 700; font-size: 14.5px; color: #111; text-transform: uppercase; }
            .item-subtitle { font-family: 'Merriweather', serif; font-weight: 600; font-style: italic; font-size: 14px; color: #333; }
            .item-date { font-family: 'Merriweather', serif; font-weight: 400; font-style: italic; font-size: 12.5px; color: #555; white-space: nowrap; margin-left: 16px; }
            .item-meta { font-size: 12.5px; color: #555; margin-bottom: 6px; }
            
            /* Lists */
            ul.bullets { padding-left: 20px; margin: 6px 0 0 0; }
            ul.bullets li { margin-bottom: 4px; padding-left: 4px; word-break: break-word; overflow-wrap: break-word; line-height: 1.6; }
            
            /* Skills Grid */
            .skills-list { display: grid; grid-template-columns: repeat(2, 1fr); row-gap: 12px; column-gap: 32px; }
            .skill-row { font-size: 13.5px; line-height: 1.5; page-break-inside: avoid; break-inside: avoid; }
            .skill-cat { font-family: 'Merriweather', serif; font-weight: 700; color: #111; margin-bottom: 2px; }
            .skill-items { color: #444; }
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
                    ${contactLinks.join('<span class="contact-separator">|</span>')}
                </div>
            </header>
        `;
    }

    private renderSummary(resume: Resume): string {
        if (!resume.summary) return '';
        return `
            <div class="section-title-wrapper"><h2>Executive Summary</h2></div>
            <p class="summary">${resume.summary}</p>
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
                    <div class="item-header">
                        <div class="item-title">${exp.company || ''}${exp.location ? ` - ${exp.location}` : ''}</div>
                        <div class="item-date">${start} – ${end}</div>
                    </div>
                    <div class="item-subtitle">${exp.role || ''}</div>
                    ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="section-title-wrapper"><h2>Professional Experience</h2></div>
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
                        <div class="item-title">${proj.name || ''}</div>
                        ${proj.link ? `<div class="item-date"><a href="${ensureHttps(proj.link)}" target="_blank">${formatLink(proj.link)}</a></div>` : ''}
                    </div>
                    ${proj.technologies && proj.technologies.length > 0 ? `<div class="item-meta">Technologies: ${proj.technologies.join(', ')}</div>` : ''}
                    ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="section-title-wrapper"><h2>Key Projects</h2></div>
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
            <div class="section-title-wrapper"><h2>Core Competencies</h2></div>
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
                    ${ed.gpa ? `<span style="float: right; font-weight: 400; font-family: 'Open Sans', sans-serif; font-style: normal; color: #555;">GPA: ${ed.gpa}</span>` : ''}
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
            <div class="skills-list" style="display: block;">
                <div class="skill-row">
                    <div class="skill-items" style="font-weight: 600;">
                        ${resume.certifications.join(' &nbsp;&bull;&nbsp; ')}
                    </div>
                </div>
            </div>
        `;
    }

    private renderAchievements(resume: Resume): string {
        if (!resume.achievements || resume.achievements.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Key Achievements</h2></div>
            <ul class="bullets" style="padding-left: 20px; margin: 0;">
                ${resume.achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
        `;
    }

    private renderLanguages(resume: Resume): string {
        if (!resume.languages || resume.languages.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Languages</h2></div>
            <div class="skills-list" style="display: block;">
                <div class="skill-row">
                    <div class="skill-items" style="font-weight: 600;">
                        ${resume.languages.join(' &nbsp;|&nbsp; ')}
                    </div>
                </div>
            </div>
        `;
    }
}
