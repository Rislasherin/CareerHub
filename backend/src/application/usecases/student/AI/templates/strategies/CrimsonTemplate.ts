import { IResumeTemplateStrategy } from "../IResumeTemplateStrategy";
import { Resume, IExperience, IProject, IEducation } from "@domain/entities/AI/resume.entity";
import { categorizeSkills, formatLink, ensureHttps } from "../utils/TemplateUtils";

export class CrimsonTemplate implements IResumeTemplateStrategy {
    public templateId = "crimson";

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
                    <div class="left-col">
                        ${this.renderLeftHeader(resume)}
                        ${this.renderLeftContact(resume)}
                        ${this.renderLeftSkills(categorizedSkills)}
                        ${this.renderLeftLanguages(resume)}
                        ${this.renderLeftCertifications(resume)}
                    </div>
                    <div class="right-col">
                        ${this.renderSummary(resume)}
                        ${this.renderExperience(resume)}
                        ${this.renderProjects(resume)}
                        ${this.renderEducation(resume)}
                        ${this.renderAchievements(resume)}
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    private getCss(): string {
        return `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');
            
            /* Reset & Base */
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                font-family: 'Outfit', sans-serif; 
                color: #1f2937; 
                line-height: 1.5; 
                background: #fff; 
                font-size: 13px;
                min-height: 100vh;
            }
            .resume-wrapper {
                display: flex;
                min-height: 100vh;
            }
            
            /* Layout */
            .left-col { width: 34%; background-color: #18181b; color: #f4f4f5; padding: 48px 32px; flex-shrink: 0; }
            .right-col { width: 66%; padding: 48px 40px; background-color: #fff; }
            
            /* Left Column */
            h1 { color: #e11d48; font-size: 36px; font-weight: 800; margin: 0 0 4px 0; line-height: 1.1; text-transform: capitalize; word-break: break-word; }
            .target-role-left { font-size: 15px; color: #a1a1aa; font-weight: 600; margin-bottom: 32px; letter-spacing: 0.5px; text-transform: uppercase; }
            
            .contact-block { margin-bottom: 40px; }
            .contact-item { font-size: 12.5px; color: #d4d4d8; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; word-break: break-all; }
            .contact-item a { color: inherit; text-decoration: none; }
            .contact-item a:hover { color: #fff; }
            
            .left-section-title { font-size: 14px; color: #fff; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin: 0 0 16px 0; border-bottom: 2px solid #3f3f46; padding-bottom: 6px; }
            
            .left-skill-cat { font-size: 12px; color: #e11d48; text-transform: uppercase; font-weight: 700; margin: 0 0 6px 0; letter-spacing: 1px; }
            .left-skill-items { margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-badge { background: rgba(255,255,255,0.1); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 400; border: 1px solid rgba(255,255,255,0.05); }
            
            /* Right Column */
            .right-section-title { font-size: 16px; color: #e11d48; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; margin: 0 0 16px 0; border-bottom: 2px solid #e11d48; padding-bottom: 6px; page-break-after: avoid; break-after: avoid; }
            .section { margin-bottom: 28px; }
            
            .summary { font-size: 13.5px; color: #3f3f46; text-align: justify; line-height: 1.7; }
            
            .item-block { margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
            .item-block:last-child { margin-bottom: 0; }
            
            .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
            .item-title { font-weight: 700; font-size: 15px; color: #18181b; }
            .item-subtitle { font-weight: 600; font-size: 14px; color: #52525b; }
            .item-date { font-size: 12px; color: #e11d48; font-weight: 700; text-align: right; white-space: nowrap; margin-left: 12px; text-transform: uppercase; }
            
            .item-meta { font-size: 12px; color: #71717a; margin-bottom: 8px; font-weight: 500; }
            .item-meta a { color: #52525b; text-decoration: none; border-bottom: 1px solid #d4d4d8; }
            .item-meta a:hover { border-color: #18181b; color: #18181b; }
            
            ul.bullets { padding-left: 18px; margin: 6px 0 0 0; font-size: 13px; color: #3f3f46; }
            ul.bullets li { margin-bottom: 6px; padding-left: 4px; overflow-wrap: break-word; word-break: break-word; line-height: 1.6; }
        `;
    }

    private renderLeftHeader(resume: Resume): string {
        return `
            <h1>${(resume.personalInfo?.fullName || 'Anonymous User').replace(' ', '<br>')}</h1>
            ${resume.targetRole ? `<div class="target-role-left">${resume.targetRole}</div>` : ''}
        `;
    }

    private renderLeftContact(resume: Resume): string {
        const contactLinks: { label: string; url: string | null; icon: string }[] = [];
        if (resume.personalInfo?.city) contactLinks.push({ label: resume.personalInfo.city, url: null, icon: "📍" });
        if (resume.personalInfo?.phone) contactLinks.push({ label: resume.personalInfo.phone, url: null, icon: "📱" });
        if (resume.personalInfo?.email) contactLinks.push({ label: resume.personalInfo.email, url: `mailto:${resume.personalInfo.email}`, icon: "✉️" });
        if (resume.personalInfo?.linkedinUrl) contactLinks.push({ label: formatLink(resume.personalInfo.linkedinUrl), url: ensureHttps(resume.personalInfo.linkedinUrl), icon: "🔗" });
        if (resume.personalInfo?.githubUrl) contactLinks.push({ label: formatLink(resume.personalInfo.githubUrl), url: ensureHttps(resume.personalInfo.githubUrl), icon: "💻" });
        if (resume.personalInfo?.portfolioUrl) contactLinks.push({ label: formatLink(resume.personalInfo.portfolioUrl), url: ensureHttps(resume.personalInfo.portfolioUrl), icon: "🌐" });
        
        return `
            <div class="contact-block">
                ${contactLinks.map(link => `
                    <div class="contact-item">
                        <span style="font-size: 14px;">${link.icon}</span>
                        ${link.url ? `<a href="${link.url}">${link.label}</a>` : link.label}
                    </div>
                `).join('')}
            </div>
        `;
    }

    private renderLeftSkills(categorizedSkills: Record<string, string[]>): string {
        const validCategories = Object.entries(categorizedSkills).filter(([_, items]) => items.length > 0);
        if (validCategories.length === 0) return '';
        
        const skillsHtml = validCategories.map(([cat, items]) => `
            <div>
                <div class="left-skill-cat">${cat}</div>
                <div class="left-skill-items">
                    ${items.map(s => `<span class="skill-badge">${s}</span>`).join('')}
                </div>
            </div>
        `).join('');

        return `
            <div style="margin-bottom: 32px;">
                <h2 class="left-section-title">Skills</h2>
                ${skillsHtml}
            </div>
        `;
    }

    private renderLeftCertifications(resume: Resume): string {
        if (!resume.certifications || resume.certifications.length === 0) return '';
        return `
            <div>
                <h2 class="left-section-title">Certifications</h2>
                <div class="left-skill-items" style="margin-top: 12px;">
                    ${resume.certifications.map(c => `<span class="skill-badge" style="background: rgba(225, 29, 72, 0.2); border-color: rgba(225, 29, 72, 0.3); color: #fda4af;">${c}</span>`).join('')}
                </div>
            </div>
        `;
    }

    private renderSummary(resume: Resume): string {
        if (!resume.summary) return '';
        return `
            <div class="section">
                <h2 class="right-section-title">Profile</h2>
                <p class="summary">${resume.summary}</p>
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
                    <div class="item-header">
                        <div class="item-title">${exp.role || ''}</div>
                        <div class="item-date">${start} – ${end}</div>
                    </div>
                    <div class="item-subtitle">${exp.company || ''}${exp.location ? ` - ${exp.location}` : ''}</div>
                    ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="section">
                <h2 class="right-section-title">Experience</h2>
                ${itemsHtml}
            </div>
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
                        ${proj.link ? `<div class="item-date" style="text-transform: none; font-weight: 500; font-size: 12.5px;"><a href="${ensureHttps(proj.link)}" target="_blank" style="color: inherit; text-decoration: none;">${formatLink(proj.link)}</a></div>` : ''}
                    </div>
                    ${proj.technologies && proj.technologies.length > 0 ? `<div class="item-meta">${proj.technologies.join(' • ')}</div>` : ''}
                    ${bullets ? `<ul class="bullets">${bullets}</ul>` : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="section">
                <h2 class="right-section-title">Projects</h2>
                ${itemsHtml}
            </div>
        `;
    }

    private renderEducation(resume: Resume): string {
        if (!resume.education || resume.education.length === 0) return '';
        const itemsHtml = resume.education.map((ed: IEducation) => `
            <div class="item-block">
                <div class="item-header">
                    <div class="item-title">${ed.degree}</div>
                    <div class="item-date">${ed.graduationYear || ''}</div>
                </div>
                <div class="item-subtitle">${ed.institution || ''}</div>
                ${ed.gpa ? `<div class="item-meta" style="margin-top: 4px;">GPA: ${ed.gpa}</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="section">
                <h2 class="right-section-title">Education</h2>
                ${itemsHtml}
            </div>
        `;
    }

    private renderLeftLanguages(resume: Resume): string {
        if (!resume.languages || resume.languages.length === 0) return '';
        return `
            <div style="margin-bottom: 32px;">
                <h2 class="left-section-title">Languages</h2>
                <div class="left-skill-items" style="margin-top: 12px;">
                    ${resume.languages.map(l => `<span class="skill-badge">${l}</span>`).join('')}
                </div>
            </div>
        `;
    }

    private renderAchievements(resume: Resume): string {
        if (!resume.achievements || resume.achievements.length === 0) return '';
        return `
            <div class="section">
                <h2 class="right-section-title">Achievements</h2>
                <ul class="bullets">
                    ${resume.achievements.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}
