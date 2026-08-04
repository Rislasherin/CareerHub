import { AnalyzeResumeUseCase } from "@application/usecases/student/AI/implementations/AnalyzeResume.usecase";
import { AutoFixResumeUseCase } from "@application/usecases/student/AI/implementations/AutoFixResume.usecase";
import { SyncProfileToResumeUseCase } from "@application/usecases/student/AI/implementations/SyncProfileToResume.usecase";
import { AIServiceFactory } from "@infrastructure/factories/AIServiceFactory";
import { ResumeRepository } from "@infrastructure/repositories/Resume.repository";
import { ResumeController } from "@presentation/http/controllers/student/Resume.controller";
import { StudentRepository } from "@infrastructure/repositories/student.repository";
import { UpdateResumeSettingsUseCase } from "@application/usecases/student/AI/implementations/UpdateResumeSettings.usecase";
import { ExportResumePdfUseCase } from "@application/usecases/student/AI/implementations/ExportResumePdf.usecase";
import { PreviewResumeHtmlUseCase } from "@application/usecases/student/AI/implementations/PreviewResumeHtml.usecase";
import { AutoFixTextUseCase } from "@application/usecases/student/AI/implementations/AutoFixText.usecase";
import { RewriteEntireResumeUseCase } from "@application/usecases/student/AI/implementations/RewriteEntireResume.usecase";
import { CreateResumeUseCase } from "@application/usecases/student/AI/implementations/CreateResume.usecase";
import { GetResumesUseCase } from "@application/usecases/student/AI/implementations/GetResumes.usecase";
import { MatchJobDescriptionUseCase } from "@application/usecases/student/AI/implementations/MatchJobDescription.usecase";
import { CoachResumeSectionUseCase } from "@application/usecases/student/AI/implementations/CoachResumeSection.usecase";

export class ResumeFactory {
    static createResumeController(): ResumeController {
        const resumeRepository = new ResumeRepository();

        const aiService = AIServiceFactory.createdService();

        const analyzeResumeUseCase = new AnalyzeResumeUseCase(
            resumeRepository,
            aiService
        );
        const studentRepository = new StudentRepository();
        const syncProfileUseCase = new SyncProfileToResumeUseCase(studentRepository, resumeRepository);
        const updateSettingsUseCase = new UpdateResumeSettingsUseCase(resumeRepository)
        const exportPdfUseCase = new ExportResumePdfUseCase(resumeRepository);
        const previewHtmlUseCase  = new PreviewResumeHtmlUseCase(resumeRepository);
        const autoFixTextUseCase = new AutoFixTextUseCase(aiService);
        const rewriteEntireResumeUseCase = new RewriteEntireResumeUseCase(aiService, studentRepository, resumeRepository);
        const createResumeUseCase = new CreateResumeUseCase(studentRepository, resumeRepository);
        const getResumesUseCase = new GetResumesUseCase(resumeRepository);
        const matchJobDescriptionUseCase = new MatchJobDescriptionUseCase(resumeRepository, aiService);
        const coachResumeSectionUseCase = new CoachResumeSectionUseCase(resumeRepository, aiService);

        return new ResumeController(analyzeResumeUseCase, syncProfileUseCase, updateSettingsUseCase, exportPdfUseCase, previewHtmlUseCase, autoFixTextUseCase, rewriteEntireResumeUseCase, createResumeUseCase, getResumesUseCase, matchJobDescriptionUseCase, coachResumeSectionUseCase);
    }
}
