import { AtsEngine } from "@application/services/ats/AtsEngine";
import { ExperienceDetailRule } from "@application/services/ats/rules/static/ExperienceDetailRule";
import { HasLinkedInRule } from "@application/services/ats/rules/static/HasLinkedInRule";
import { IAnalyzeResumeUseCase } from "../interfaces/IAnalyzeResume.usecase";
import { IAIService } from "@application/interfaces/IAIService";
import { ExperiencedSoftwareEngineerProfile } from "@application/services/ats/profiles/ExperiencedProfile";
import { IResumeRepository } from "@domain/repositories/AI/IResumeRepository";
import { AtsReport } from "@application/services/ats/types/ats.types";

import { HasExperienceRule } from "@application/services/ats/rules/static/HasExperienceRule";
import { GeminiAtsRule } from "@application/services/ats/rules/dynamic/GeminiAtsRule";

export class AnalyzeResumeUseCase implements IAnalyzeResumeUseCase {
    private _atsEngine: AtsEngine

    constructor(
        private readonly _resumeRepository: IResumeRepository,
        private readonly _aiService: IAIService,
    ) {
        this._atsEngine = new AtsEngine([
            new HasLinkedInRule(),
            new HasExperienceRule(),
            new ExperienceDetailRule(),
            new GeminiAtsRule(this._aiService)
        ]);
    }
    async execute(studentId: string): Promise<AtsReport> {
        let resume = await this._resumeRepository.findByStudentId(studentId);

        if (!resume) {
            const { Resume } = await import("@domain/entities/AI/resume.entity.js");
            const mockResume = new Resume(
                null,
                studentId,
                "Software Engineer",
                {
                    fullName: "Jane Student",
                    email: "jane@university.edu",
                    phone: "+1 555-0123",
                    // Intentionally leaving out LinkedIn/GitHub so some rules fail!
                },
                "Motivated software engineering student with strong foundation in web development.",
                [{ institution: "State University", degree: "B.S. Computer Science", graduationYear: 2026, gpa: "3.8" }],
                [{
                    company: "Tech Startup Inc.",
                    role: "Software Engineering Intern",
                    startDate: new Date("2025-05-01"),
                    endDate: new Date("2025-08-01"),
                    isCurrent: false,
                    bulletPoints: [
                        "Built a dashboard", // Intentionally weak bullet for rules to catch
                        "Used React and Node.js to create APIs"
                    ]
                }],
                [],
                ["JavaScript", "React", "Node.js"],
                []
            );
            
            await this._resumeRepository.save(mockResume);
            resume = await this._resumeRepository.findByStudentId(studentId);
        }

        if (!resume) {
            throw new Error("Resume not found.");
        }

        const atsReport = await this._atsEngine.evaluate(resume, ExperiencedSoftwareEngineerProfile)

        return atsReport;
    };
}