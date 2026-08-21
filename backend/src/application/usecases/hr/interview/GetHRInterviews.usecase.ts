import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { Interview } from "@domain/entities/Interview";

export class GetHRInterviewsUseCase {
  constructor(
    private readonly _interviewRepository: IInterviewRepository,
    private readonly _studentRepository: IStudentRepository,
    private readonly _jobRepository: IJobRepository
  ) {}

  async execute(companyId: string): Promise<any[]> {
    const interviews = await this._interviewRepository.findByCompanyId(companyId);
    
    return Promise.all(interviews.map(async (inv) => {
      let candidateName = "Unknown Candidate";
      let college = "Unknown College";
      let jobTitle = "Unknown Job";

      try {
        const student = await this._studentRepository.findById(inv.studentId);
        if (student) {
          candidateName = `${student.firstName} ${student.lastName}`;
          college = student.branch || student.department || "N/A";
        }
        
        const job = await this._jobRepository.findById(inv.jobId);
        if (job) {
          jobTitle = job.title;
        }
      } catch (err) {
        // Ignore fetch errors for related entities
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
    }));
  }
}
