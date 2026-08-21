import { IResumeTemplateStrategy } from "../IResumeTemplateStrategy";
import { Resume, IExperience, IProject, IEducation } from "@domain/entities/resume.entity";
import { categorizeSkills, formatLink, ensureHttps } from "../utils/TemplateUtils";

export class ModernTemplate implements IResumeTemplateStrategy {
    public templateId = "modern";

    generateHtml(resume: Resume, visibilityMap?: Record<string, boolean>): string {
        const categorizedSkills = categorizeSkills(resume.skills || []);
        const themeColor = resume.settings?.themeColor || '#2563eb';

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    ${this.getCss(themeColor)}
                </style>
            </head>
            <body>
                <div class="resume-wrapper">
                    ${this.renderHeader(resume, themeColor)}
                    <div class="main-content">
                        ${this.renderSummary(resume)}
                        ${this.renderExperience(resume, themeColor)}
                        ${this.renderProjects(resume, themeColor)}
                        ${this.renderSkills(categorizedSkills, themeColor)}
                        ${this.renderEducation(resume, themeColor)}
                        ${this.renderCertifications(resume, themeColor)}
                        ${this.renderAchievements(resume, themeColor)}
                        ${this.renderLanguages(resume, themeColor)}
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    private getCss(themeColor: string): string {
        return `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            /* Reset & Base */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: 'Roboto', sans-serif; 
                color: #334155; 
                line-height: 1.6; 
                background: #fff; 
                font-size: 13.5px;
            }
            .resume-wrapper {
                display: flex; 
                flex-direction: column; 
                min-height: 100vh;
            }
            .main-content {
                padding: 40px 48px;
            }
            
            /* Typography */
            h1 { font-size: 34px; font-weight: 700; color: #fff; margin-bottom: 6px; letter-spacing: -0.5px; text-transform: capitalize; }
            .section-title-wrapper { margin: 24px 0 16px 0; page-break-after: avoid; break-after: avoid; display: flex; align-items: center; }
            h2 { font-size: 15px; font-weight: 700; color: ${themeColor}; text-transform: uppercase; letter-spacing: 1px; }
            .section-title-wrapper::after { content: ''; flex: 1; height: 1.5px; background-color: #e2e8f0; margin-left: 16px; }
            
            p, span, li { color: #475569; }
            a { color: inherit; text-decoration: none; }
            
            /* Header */
            .header { background-color: ${themeColor}; padding: 40px 48px; color: #fff; text-align: left; }
            .target-role { font-size: 16px; font-weight: 500; color: #fff; opacity: 0.9; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
            .contact-info { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; font-size: 13px; opacity: 0.9; }
            .contact-info a:hover { opacity: 1; text-decoration: underline; }
            
            /* Content Blocks */
            .summary { text-align: justify; margin-bottom: 16px; }
            
            .item-block { margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid; border-left: 2px solid #e2e8f0; padding-left: 16px; margin-left: 4px; position: relative; }
            .item-block:last-child { margin-bottom: 0; }
            .item-block::before { content: ''; position: absolute; left: -21px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background-color: ${themeColor}; border: 2px solid #fff; box-shadow: 0 0 0 1px #e2e8f0; }
            
            .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
            .item-title { font-weight: 700; font-size: 14.5px; color: #0f172a; }
            .item-subtitle { font-weight: 500; font-size: 14px; color: ${themeColor}; }
            .item-date { font-weight: 500; font-size: 12px; color: #64748b; white-space: nowrap; margin-left: 16px; background: #f1f5f9; padding: 2px 8px; border-radius: 12px; }
            .item-meta { font-size: 12.5px; color: #64748b; margin-bottom: 6px; font-weight: 500; }
            .item-meta a:hover { color: ${themeColor}; text-decoration: underline; }
            
            /* Lists */
            ul.bullets { padding-left: 18px; margin: 6px 0 0 0; }
            ul.bullets li { margin-bottom: 4px; padding-left: 4px; word-break: break-word; overflow-wrap: break-word; }
            ul.bullets li::marker { color: #94a3b8; }
            
            /* Skills Grid */
            .skills-list { display: flex; flex-direction: column; gap: 8px; border-left: 2px solid transparent; padding-left: 16px; margin-left: 4px; }
            .skill-row { display: flex; font-size: 13.5px; line-height: 1.5; page-break-inside: avoid; break-inside: avoid; }
            .skill-cat { width: 130px; font-weight: 700; color: #0f172a; flex-shrink: 0; padding-top: 2px; }
            .skill-items { flex: 1; }
            .skill-badge { display: inline-block; background: #f1f5f9; color: #334155; padding: 2px 8px; border-radius: 4px; margin: 0 6px 6px 0; font-size: 12.5px; border: 1px solid #e2e8f0; }
        `;
    }

    private renderHeader(resume: Resume, themeColor: string): string {
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
                    ${contactLinks.join('<span>&bull;</span>')}
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

    private renderExperience(resume: Resume, themeColor: string): string {
        if (!resume.experience || resume.experience.length === 0) return '';
        const itemsHtml = resume.experience.map((exp: IExperience) => {
            const start = exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
            const end = exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
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

    private renderProjects(resume: Resume, themeColor: string): string {
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
                    ${proj.technologies && proj.technologies.length > 0 ? `<div class="item-meta"><strong>Tech Stack:</strong> ${proj.technologies.join(', ')}</div>` : ''}
                    ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="section-title-wrapper"><h2>Projects</h2></div>
            ${itemsHtml}
        `;
    }

    private renderSkills(categorizedSkills: Record<string, string[]>, themeColor: string): string {
        const validCategories = Object.entries(categorizedSkills).filter(([_, items]) => items.length > 0);
        if (validCategories.length === 0) return '';

        const skillsHtml = validCategories.map(([cat, items]) => `
            <div class="skill-row">
                <div class="skill-cat">${cat}</div>
                <div class="skill-items">
                    ${items.map(s => `<span class="skill-badge">${s}</span>`).join('')}
                </div>
            </div>
        `).join('');

        return `
            <div class="section-title-wrapper"><h2>Skills</h2></div>
            <div class="skills-list">${skillsHtml}</div>
        `;
    }

    private renderEducation(resume: Resume, themeColor: string): string {
        if (!resume.education || resume.education.length === 0) return '';
        const itemsHtml = resume.education.map((ed: IEducation) => `
            <div class="item-block">
                <div class="item-header">
                    <div class="item-title">${ed.degree}</div>
                    <div class="item-date">${ed.graduationYear || ''}</div>
                </div>
                <div class="item-subtitle" style="color: #475569;">
                    ${ed.institution || ''}
                    ${ed.gpa ? `<span style="float: right; font-weight: 500; font-style: normal; color: #64748b;">CGPA: ${ed.gpa}</span>` : ''}
                </div>
            </div>
        `).join('');

        return `
            <div class="section-title-wrapper"><h2>Education</h2></div>
            ${itemsHtml}
        `;
    }

    private renderCertifications(resume: Resume, themeColor: string): string {
        if (!resume.certifications || resume.certifications.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Certifications</h2></div>
            <div class="skills-list">
                <div class="skill-row">
                    <div class="skill-items">
                        ${resume.certifications.map(c => `<span class="skill-badge">${c}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    private renderAchievements(resume: Resume, themeColor: string): string {
        if (!resume.achievements || resume.achievements.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Achievements</h2></div>
            <ul class="bullets" style="padding-left: 18px; margin: 0; margin-left: 18px;">
                ${resume.achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
        `;
    }

    private renderLanguages(resume: Resume, themeColor: string): string {
        if (!resume.languages || resume.languages.length === 0) return '';
        return `
            <div class="section-title-wrapper"><h2>Languages</h2></div>
            <div class="skills-list">
                <div class="skill-row">
                    <div class="skill-items">
                        ${resume.languages.map(l => `<span class="skill-badge">${l}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}
