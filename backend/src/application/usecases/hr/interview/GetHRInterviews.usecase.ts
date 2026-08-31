import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { Interview } from "@domain/entities/Interview";
import { IGetHRInterviewsUseCase } from "./interfaces/IGetHRInterviews.usecase";

export class GetHRInterviewsUseCase implements IGetHRInterviewsUseCase {
  constructor(
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _studentRepository: IStudentRepository,
    private readonly _jobRepository: IJobRepository
  ) {}

  async execute(companyId: string): Promise<any[]> {
    const interviews = await this._interviewRepository.findByCompanyId(companyId);
    
    // Deduplicate IDs
    const uniqueStudentIds = [...new Set(interviews.map(i => i.studentId))];
    const uniqueJobIds = [...new Set(interviews.map(i => i.jobId).filter(id => id))];

    // Fetch unique records in parallel
    const studentMap = new Map<string, any>();
    const jobMap = new Map<string, any>();

    await Promise.all([
      ...uniqueStudentIds.map(async id => {
         try {
            const student = await this._studentRepository.findById(id);
            if (student) studentMap.set(id, student);
         } catch(e) {}
      }),
      ...uniqueJobIds.map(async id => {
         try {
            const job = await this._jobRepository.findById(id);
            if (job) jobMap.set(id, job);
         } catch(e) {}
      })
    ]);

    return interviews.map((inv) => {
      let candidateName = "Unknown Candidate";
      let college = "Unknown College";
      let jobTitle = "Unknown Job";

      const student = studentMap.get(inv.studentId);
      if (student) {
        candidateName = `${student.firstName} ${student.lastName}`;
        college = student.branch || student.department || "N/A";
      }
      
      const job = jobMap.get(inv.jobId);
      if (job) {
        jobTitle = job.title;
      }

      return {
        id: inv.id,
        candidate: {
          name: candidateName,
          college: college,
          applicationId: inv.studentId, // We use studentId as application fallback for now
        },
        title: jobTitle,
        type: inv.type,
        interviewer: {
          name: "AI Interviewer",
          role: "AI Agent"
        },
        scheduledAt: inv.scheduledAt,
        status: inv.status,
      };
    });
  }
}
