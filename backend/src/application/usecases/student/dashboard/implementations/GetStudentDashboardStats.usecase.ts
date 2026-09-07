import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IAIPracticeInterviewRepository } from "@domain/repositories/ai-practice/IAIPracticeInterviewRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IGetStudentDashboardStatsUseCase } from "../interfaces/IGetStudentDashboardStats.usecase";
import { StudentDashboardStatsResponseDTO } from "@application/dtos/student/Response/StudentDashboardStats.response.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { JobStatus } from "@domain/enums/JobStatus.enum";

export class GetStudentDashboardStatsUseCase implements IGetStudentDashboardStatsUseCase {
    constructor(
        private readonly _studentRepository: IStudentRepository,
        private readonly _jobRepository: IJobRepository,
        private readonly _jobApplicationRepository: IJobApplicationRepository,
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _aiPracticeRepository: IAIPracticeInterviewRepository,
        private readonly _companyRepository: ICompanyRepository
    ) {}

    async execute(studentId: string): Promise<StudentDashboardStatsResponseDTO> {
        const student = await this._studentRepository.findById(studentId);
        if (!student) {
            throw new AppError("Student not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        // 1. Fetch related data
        const applications = await this._jobApplicationRepository.findByStudentId(studentId);
        const interviews = await this._interviewRepository.findByStudentId(studentId);
        const aiPractices = await this._aiPracticeRepository.findByStudentId(studentId);
        const latestAiPractice = await this._aiPracticeRepository.findLatestCompletedByStudentId(studentId);

        // 2. Compute quick stats
        const profileCompletion = student.profileCompletionScore || 25;
        const shortlistedApps = applications.filter(app => app.status === 'SHORTLISTED' || app.status === 'SELECTED' || app.status === 'OFFERED');

        // 3. Recent Applications
        const recentApplications: StudentDashboardStatsResponseDTO['recentApplications'] = [];
        const sortedApps = [...applications].sort((a, b) => {
            const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
            const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
            return dateB - dateA;
        });
        
        for (const app of sortedApps.slice(0, 5)) {
            const job = await this._jobRepository.findById(app.jobId);
            if (job) {
                const company = await this._companyRepository.findById(job.companyId);
                recentApplications.push({
                    id: app.id as string,
                    jobId: app.jobId,
                    jobTitle: job.title,
                    company: company ? company.name : 'Unknown Company',
                    status: app.status,
                    appliedDate: app.appliedAt || new Date()
                });
            }
        }

        // 4. Upcoming Events (Interviews)
        const upcomingEvents: StudentDashboardStatsResponseDTO['upcomingEvents'] = [];
        const scheduledInterviews = interviews.filter(i => i.status === 'SCHEDULED');
        for (const interview of scheduledInterviews) {
             const job = await this._jobRepository.findById(interview.jobId);
             let companyName = 'Unknown Company';
             if (job) {
                 const company = await this._companyRepository.findById(job.companyId);
                 if (company) companyName = company.name;
             }
             if (interview.scheduledAt && new Date(interview.scheduledAt).getTime() > new Date().getTime()) {
                 upcomingEvents.push({
                     id: interview.id as string,
                     title: `${interview.type} Interview`,
                     company: companyName,
                     date: interview.scheduledAt,
                     type: 'INTERVIEW'
                 });
             }
        }
        upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 5. Recommended Jobs (Skill matching)
        const recommendedJobs: StudentDashboardStatsResponseDTO['recommendedJobs'] = [];
        let openJobs: any[] = [];
        if (student.collegeId) {
            openJobs = await this._jobRepository.findByCollegeIdAndStatus(student.collegeId, JobStatus.ACTIVE);
        }
        
        const studentSkills = (Object.values(student.skills || {}).flat().filter(Boolean) as string[]).map((s: any) => String(s).toLowerCase().trim());
        
        for (const job of openJobs) {
            // Check if already applied
            if (applications.some(a => a.jobId === job.id)) continue;

            const company = await this._companyRepository.findById(job.companyId);
            const jobSkills = job.requiredSkills.map((s: any) => String(s).toLowerCase().trim());
            let matchCount = 0;
            for (const skill of jobSkills) {
                if (studentSkills.includes(skill)) matchCount++;
            }
            const matchPercentage = jobSkills.length > 0 ? Math.round((matchCount / jobSkills.length) * 100) : 50;

            recommendedJobs.push({
                id: job.id as string,
                title: job.title,
                company: company ? company.name : 'Unknown Company',
                location: job.location,
                employmentType: job.type,
                skills: job.requiredSkills.slice(0, 4),
                matchPercentage: matchPercentage,
                salary: `${job.minSalary} - ${job.maxSalary} ${job.salaryType}`,
                postedDate: job.createdAt || new Date()
            });
        }
        // Sort by match percentage
        recommendedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
        const topRecommendedJobs = recommendedJobs.slice(0, 4);

        // 6. AI Practice Summary
        let aiPracticeSummary = null;
        if (latestAiPractice) {
            aiPracticeSummary = {
                hasPracticed: true,
                latestScore: latestAiPractice.finalFeedback?.overallScore,
                practicesCompleted: aiPractices.filter(p => p.status === 'COMPLETED').length,
                jobRole: latestAiPractice.topics.join(', '),
                weakestArea: latestAiPractice.finalFeedback?.weakAreas?.[0] || 'Technical depth'
            };
        } else {
            aiPracticeSummary = {
                hasPracticed: false,
                practicesCompleted: 0
            };
        }

        // 7. Resume
        const resumeSummary = {
            hasResume: !!student.resume?.url,
            resumeName: student.resume?.fileName || 'My Resume',
            updatedAt: student.updatedAt,
            atsScore: student.resumeScore
        };

        // 8. Next Action
        let nextAction: StudentDashboardStatsResponseDTO['nextAction'] = null;
        if (profileCompletion < 80) {
            nextAction = {
                type: 'PROFILE',
                title: 'Complete your profile',
                description: `Your profile is ${profileCompletion}% complete. Adding your projects and GitHub profile can improve your job matches.`,
                actionText: 'Complete Profile',
                actionLink: '/student/profile'
            };
        } else if (!resumeSummary.hasResume) {
            nextAction = {
                type: 'RESUME',
                title: 'Upload your resume',
                description: 'You need a resume to start applying to jobs. Use our AI builder or upload your own.',
                actionText: 'Create Resume',
                actionLink: '/student/resume'
            };
        } else if (upcomingEvents.length > 0) {
            nextAction = {
                type: 'INTERVIEW',
                title: 'Interview coming up!',
                description: `You have an interview with ${upcomingEvents[0].company} on ${new Date(upcomingEvents[0].date).toLocaleDateString()}. Make sure you're prepared.`,
                actionText: 'View Details',
                actionLink: '/student/interviews'
            };
        } else if (!aiPracticeSummary.hasPracticed) {
            nextAction = {
                type: 'PRACTICE',
                title: 'Practice with AI',
                description: 'Take a mock interview to assess your technical skills and get AI feedback.',
                actionText: 'Start Practice',
                actionLink: '/student/ai-practice'
            };
        } else if (topRecommendedJobs.length > 0) {
            nextAction = {
                type: 'JOB',
                title: 'You have strong job matches',
                description: `We found ${topRecommendedJobs.length} roles that match your skills. Apply now before the deadline.`,
                actionText: 'View Jobs',
                actionLink: '/student/jobs'
            };
        }

        return {
            studentId: student.id as string,
            stats: {
                applications: applications.length,
                interviews: interviews.length,
                shortlisted: shortlistedApps.length,
                profileCompletion
            },
            recommendedJobs: topRecommendedJobs,
            recentApplications,
            aiPractice: aiPracticeSummary,
            upcomingEvents: upcomingEvents.slice(0, 4),
            nextAction,
            resume: resumeSummary
        };
    }
}
