import { AnalyzeResumeUseCase } from "@application/usecases/student/AI/implementations/AnalyzeResume.usecase";
import { AutoFixResumeUseCase } from "@application/usecases/student/AI/implementations/AutoFixResume.usecase";
import { SyncProfileToResumeUseCase } from "@application/usecases/student/AI/implementations/SyncProfileToResume.usecase";
import { AIServiceFactory } from "@infrastructure/factories/AIServiceFactory";
import { ResumeRepository } from "@infrastructure/repositories/Resume.repository";
import { ResumeController } from "@presentation/http/controllers/student/Resume.controller";
import { StudentRepository } from "@infrastructure/repositories/student.repository";
import { UpdateResumeSettingsUseCase } from "@application/usecases/student/AI/implementations/UpdateResumeSettings.usecase";

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
        const autoFixResumeUseCase = new AutoFixResumeUseCase(aiService);

        return new ResumeController(analyzeResumeUseCase, syncProfileUseCase,updateSettingsUseCase);
    }
}
