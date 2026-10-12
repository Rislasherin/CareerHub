import { PostJobUseCase } from "../../src/application/usecases/hr/job-engine/implementations/PostJob.usecase";
import { UpdateJobUseCase } from "../../src/application/usecases/hr/job-engine/implementations/UpdateJob.usecase";
import { CancelJobScheduleUseCase } from "../../src/application/usecases/hr/job-engine/implementations/CancelJobSchedule.usecase";
import { PublishJobNowUseCase } from "../../src/application/usecases/hr/job-engine/implementations/PublishJobNow.usecase";
import { ProcessScheduledJobsUseCase } from "../../src/application/usecases/hr/job-engine/implementations/ProcessScheduledJobs.usecase";
import { ApproveJobUseCase } from "../../src/application/usecases/college/job-approvals/implementations/ApproveJob.usecase";
import { ApplyToJobUseCase } from "../../src/application/usecases/student/implementations/ApplyToJob.usecase";
import { GetStudentJobsUseCase } from "../../src/application/usecases/student/implementations/GetStudentJobs.usecase";
import { Job } from "../../src/domain/entities/Job";
import { Student } from "../../src/domain/entities/student";
import { JobStatus } from "../../src/domain/enums/JobStatus.enum";
import { JobType } from "../../src/domain/enums/JobType.enum";
import { JobApplication } from "../../src/domain/entities/JobApplication";
import { JobApplicationStatus } from "../../src/domain/enums/JobApplicationStatus.enum";
import { AppError } from "../../src/application/errors/AppError";

async function runScheduledJobDraftWorkflowTests() {
  console.log("==========================================================");
  console.log("   DRAFT & SCHEDULED JOB PUBLISHING TEST SUITE           ");
  console.log("==========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // In-memory Job store
  const jobsDb = new Map<string, Job>();
  let idCounter = 1;

  const mockJobRepo: any = {
    create: async (job: Job) => {
      const id = job.id || `job_${idCounter++}`;
      const created = Job.create({ ...job.toJSON(), id, createdAt: new Date() });
      jobsDb.set(id, created);
      return created;
    },
    findById: async (id: string) => {
      const job = jobsDb.get(id);
      return job ? Job.create(job.toJSON()) : null;
    },
    update: async (id: string, updated: Job) => {
      jobsDb.set(id, Job.create(updated.toJSON()));
      return jobsDb.get(id)!;
    },
    findByCompanyId: async (companyId: string) => {
      return Array.from(jobsDb.values()).filter(j => j.companyId === companyId && !j.isDeleted);
    },
    findByCollegeIdAndStatus: async (collegeId: string, status: JobStatus) => {
      return Array.from(jobsDb.values()).filter(j => {
        if (j.isDeleted) return false;
        if (status === JobStatus.PENDING_REVIEW) {
          return j.status === JobStatus.PENDING_REVIEW && (j.collegeId === collegeId || j.collegeId === "ALL");
        }
        if (status === JobStatus.APPROVED) {
          return (j.collegeId === collegeId && (j.status === JobStatus.APPROVED || j.status === JobStatus.ACTIVE)) ||
                 (j.collegeId === "ALL" && (j.approvedColleges || []).includes(collegeId) && (j.status === JobStatus.APPROVED || j.status === JobStatus.ACTIVE));
        }
        return false;
      });
    },
    findDueScheduledJobs: async (now: Date = new Date()) => {
      return Array.from(jobsDb.values()).filter(j =>
        !j.isDeleted &&
        j.status === JobStatus.SCHEDULED &&
        j.scheduledPublishAt !== undefined &&
        new Date(j.scheduledPublishAt).getTime() <= now.getTime()
      );
    },
    claimAndPublishScheduledJob: async (jobId: string, targetStatus: JobStatus) => {
      const job = jobsDb.get(jobId);
      if (!job || job.isDeleted || job.status !== JobStatus.SCHEDULED) {
        return false;
      }
      // Atomic claim simulation
      const updated = Job.create({
        ...job.toJSON(),
        status: targetStatus,
        publishOption: "publish_now"
      });
      jobsDb.set(jobId, updated);
      return true;
    }
  };

  // Student DB & Repository
  const studentsDb = new Map<string, Student>();
  const mockStudentRepo: any = {
    findById: async (id: string) => studentsDb.get(id) || null
  };

  // Applications DB & Repository
  const applicationsDb: JobApplication[] = [];
  const mockApplicationRepo: any = {
    create: async (app: JobApplication) => {
      applicationsDb.push(app);
      return app;
    },
    findByJobAndStudent: async (jobId: string, studentId: string) => {
      return applicationsDb.find(a => a.jobId === jobId && a.studentId === studentId) || null;
    },
    countByStudentIdSince: async () => 0
  };

  const mockNotificationUseCase: any = {
    execute: async () => {}
  };

  const mockCompanyRepo: any = {
    findById: async () => ({ companyName: "Test Co", logo: "" })
  };

  // Instantiating Use Cases
  const postJobUseCase = new PostJobUseCase(mockJobRepo);
  const updateJobUseCase = new UpdateJobUseCase(mockJobRepo);
  const cancelJobScheduleUseCase = new CancelJobScheduleUseCase(mockJobRepo);
  const publishJobNowUseCase = new PublishJobNowUseCase(mockJobRepo);
  const processScheduledJobsUseCase = new ProcessScheduledJobsUseCase(mockJobRepo);
  const approveJobUseCase = new ApproveJobUseCase(mockJobRepo);
  const applyToJobUseCase = new ApplyToJobUseCase(mockStudentRepo, mockJobRepo, mockApplicationRepo, mockNotificationUseCase);
  const getStudentJobsUseCase = new GetStudentJobsUseCase(mockStudentRepo, mockJobRepo, mockCompanyRepo);

  // Seed sample student
  const sampleStudent = Student.create({
    id: "student_1",
    userId: "user_s1",
    collegeId: "college_1",
    personalInfo: {
      firstName: "Alex",
      lastName: "Hunter",
      email: "alex@college.edu",
      phone: "9876543210"
    },
    academicDetails: {
      degree: "B.Tech",
      branch: "Computer Science",
      batch: 2026,
      currentSemester: 8,
      cgpa: 8.5,
      backlogs: 0
    },
    isProfileComplete: true,
    isApproved: true,
    skills: {
      languages: ["TypeScript"],
      frameworks: ["Node.js"],
      databases: [],
      cloudDevops: [],
      tools: []
    } as any
  });
  studentsDb.set("student_1", sampleStudent);

  console.log("\n--- Requirement 1: Publish Now preserves the existing submission workflow ---");
  const publishedJob = await postJobUseCase.execute("company_A", {
    title: "Senior Backend Engineer",
    category: "Software Development",
    collegeId: "ALL",
    openings: 3,
    deadline: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    type: "full-time" as any,
    eligibility: {
      minCGPA: 7.0,
      allowedBacklogs: 0,
      eligibleBranches: ["Computer Science"],
      passingYear: 2026,
      degreeType: "B.Tech"
    },
    salaryType: "per_month",
    minSalary: 80000,
    maxSalary: 120000,
    workMode: "on-site",
    interviewMode: "online",
    rounds: [{ roundNumber: 1, name: "Tech Interview", type: "TECHNICAL" }],
    publishOption: "publish_now"
  } as any);

  assert(publishedJob.status === JobStatus.PENDING_REVIEW, "Publish Now assigns status PENDING_REVIEW");
  assert(publishedJob.publishOption === "publish_now", "publishOption stored as publish_now");
  assert(publishedJob.scheduledPublishAt === undefined, "scheduledPublishAt remains undefined for publish_now");

  console.log("\n--- Requirement 2: Save as Draft persists changes without publishing the job ---");
  const draftJob = await postJobUseCase.execute("company_A", {
    title: "Frontend Architect (Draft)",
    category: "Engineering",
    collegeId: "ALL",
    publishOption: "draft"
  } as any);

  assert(draftJob.status === JobStatus.DRAFT, "Draft job has status DRAFT");
  assert(draftJob.publishOption === "draft", "Draft job has publishOption 'draft'");
  assert(draftJob.isDraft() === true, "job.isDraft() returns true");

  console.log("\n--- Requirement 3: Incomplete drafts can be saved only where intended (title required) ---");
  let missingTitleBlocked = false;
  try {
    await postJobUseCase.execute("company_A", {
      title: "",
      publishOption: "draft"
    } as any);
  } catch (err: any) {
    missingTitleBlocked = true;
  }
  assert(missingTitleBlocked, "Saving draft without title is rejected with validation error");

  console.log("\n--- Requirement 4: Drafts are inaccessible to unauthorized companies ---");
  let unauthorizedUpdateBlocked = false;
  try {
    await updateJobUseCase.execute(draftJob.id, "company_B", {
      title: "Hacked Draft Title",
      publishOption: "draft"
    } as any);
  } catch (err: any) {
    unauthorizedUpdateBlocked = err.statusCode === 403 || err.message.includes("Unauthorized");
  }
  assert(unauthorizedUpdateBlocked, "Other company cannot update another company's draft (403)");

  let unauthorizedCancelBlocked = false;
  try {
    await cancelJobScheduleUseCase.execute(draftJob.id, "company_B");
  } catch (err: any) {
    unauthorizedCancelBlocked = err.statusCode === 403 || err.message.includes("Unauthorized");
  }
  assert(unauthorizedCancelBlocked, "Other company cannot cancel schedule of another company's job (403)");

  console.log("\n--- Requirement 5: Draft jobs do not appear in college approval queues or student discovery ---");
  const collegeReviewList = await mockJobRepo.findByCollegeIdAndStatus("college_1", JobStatus.PENDING_REVIEW);
  const draftInReviewQueue = collegeReviewList.some((j: Job) => j.id === draftJob.id);
  assert(!draftInReviewQueue, "Draft job is not present in college approval review queue");

  const studentJobs = await getStudentJobsUseCase.execute("student_1");
  const draftInStudentJobs = studentJobs.some((j: any) => j.id === draftJob.id);
  assert(!draftInStudentJobs, "Draft job is not visible to students in job discovery");

  console.log("\n--- Requirement 6: Valid scheduled job is saved with correct timestamp & timezone ---");
  const futureScheduleDate = new Date(Date.now() + 5 * 24 * 3600 * 1000);
  const futureDeadlineDate = new Date(Date.now() + 15 * 24 * 3600 * 1000);

  const scheduledJob = await postJobUseCase.execute("company_A", {
    title: "DevOps Engineer (Scheduled)",
    category: "Cloud",
    collegeId: "ALL",
    openings: 2,
    deadline: futureDeadlineDate.toISOString(),
    type: "full-time" as any,
    salaryType: "per_year",
    minSalary: 1000000,
    maxSalary: 1500000,
    workMode: "remote",
    interviewMode: "online",
    rounds: [{ roundNumber: 1, name: "Screening", type: "APTITUDE" }],
    publishOption: "schedule",
    scheduledPublishAt: futureScheduleDate.toISOString(),
    scheduledTimezone: "Asia/Kolkata"
  } as any);

  assert(scheduledJob.status === JobStatus.SCHEDULED, "Job status is SCHEDULED");
  assert(scheduledJob.isScheduled() === true, "job.isScheduled() returns true");
  assert(scheduledJob.scheduledTimezone === "Asia/Kolkata", "scheduledTimezone preserved accurately");
  assert(scheduledJob.scheduledPublishAt !== undefined, "scheduledPublishAt timestamp is persisted");

  console.log("\n--- Requirement 7: Invalid or past scheduling times are rejected ---");
  let pastScheduleBlocked = false;
  try {
    await postJobUseCase.execute("company_A", {
      title: "Invalid Past Scheduled Job",
      category: "QA",
      openings: 1,
      deadline: futureDeadlineDate.toISOString(),
      minSalary: 50000,
      maxSalary: 70000,
      publishOption: "schedule",
      scheduledPublishAt: new Date(Date.now() - 3600 * 1000).toISOString()
    } as any);
  } catch (err: any) {
    pastScheduleBlocked = err.message.includes("future");
  }
  assert(pastScheduleBlocked, "Scheduling in the past is rejected with error");

  console.log("\n--- Requirement 8: Editing or cancelling a schedule prevents the old schedule from being processed ---");
  const cancelResult = await cancelJobScheduleUseCase.execute(scheduledJob.id, "company_A");
  assert(cancelResult.status === JobStatus.DRAFT, "Cancelling schedule transitions job to DRAFT status");
  assert(cancelResult.scheduledPublishAt === undefined, "scheduledPublishAt is cleared upon schedule cancellation");

  // Attempting to process scheduled jobs should find 0 due jobs
  const dueJobsAfterCancel = await mockJobRepo.findDueScheduledJobs(new Date(Date.now() + 10 * 24 * 3600 * 1000));
  const cancelledFoundInDue = dueJobsAfterCancel.some((j: Job) => j.id === scheduledJob.id);
  assert(!cancelledFoundInDue, "Cancelled schedule is not returned by findDueScheduledJobs");

  console.log("\n--- Requirement 9: Due schedule enters the correct existing workflow exactly once ---");
  // Schedule a new job set to mature 1 minute ago
  const matureScheduleDate = new Date(Date.now() - 60 * 1000);
  const matureJob = await mockJobRepo.create(Job.create({
    companyId: "company_A",
    collegeId: "ALL",
    title: "Data Analyst",
    category: "Analytics",
    openings: 1,
    deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    type: "full-time" as any,
    salaryType: "per_month",
    minSalary: 60000,
    maxSalary: 90000,
    workMode: "on-site",
    interviewMode: "online",
    status: JobStatus.SCHEDULED,
    publishOption: "schedule",
    scheduledPublishAt: matureScheduleDate,
    scheduledTimezone: "UTC",
    rounds: [{ roundNumber: 1, name: "HR", type: "HR" }]
  }));

  const processedCount = await processScheduledJobsUseCase.execute(new Date());
  assert(processedCount >= 1, "ProcessScheduledJobsUseCase claims and transitions due job");

  const maturedAfterRun = await mockJobRepo.findById(matureJob.id);
  assert(maturedAfterRun?.status === JobStatus.PENDING_REVIEW, "Matured job enters PENDING_REVIEW workflow status");

  console.log("\n--- Requirement 10: Worker restart or retry does not create duplicates or process twice ---");
  const secondRunCount = await processScheduledJobsUseCase.execute(new Date());
  assert(secondRunCount === 0, "Second worker pass processes 0 jobs (idempotent, no duplicates)");

  console.log("\n--- Requirement 11: The scheduler does not bypass college approval requirements ---");
  assert(maturedAfterRun?.status !== JobStatus.APPROVED, "Scheduled job is NOT automatically approved; awaits college review");

  // College approves the job
  await approveJobUseCase.execute("college_1", maturedAfterRun!.id);
  const approvedMaturedJob = await mockJobRepo.findById(maturedAfterRun!.id);
  assert(
    (approvedMaturedJob?.approvedColleges || []).includes("college_1"),
    "College review approval is independently recorded following scheduling transition"
  );

  console.log("\n--- Requirement 12: Students cannot apply before the job satisfies all existing requirements ---");
  // Create an unapproved scheduled job
  const unapprovedScheduled = await mockJobRepo.create(Job.create({
    companyId: "company_A",
    collegeId: "college_1",
    title: "Unapproved Scheduled Job",
    category: "IT",
    openings: 1,
    deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000),
    type: "full-time" as any,
    status: JobStatus.SCHEDULED,
    salaryType: "per_month",
    minSalary: 50000,
    maxSalary: 70000,
    workMode: "on-site",
    interviewMode: "online",
    rounds: []
  }));

  let studentApplicationBlockedOnScheduled = false;
  try {
    await applyToJobUseCase.execute("student_1", unapprovedScheduled.id);
  } catch (err: any) {
    studentApplicationBlockedOnScheduled = true;
  }
  assert(studentApplicationBlockedOnScheduled, "Student application to scheduled job is rejected");

  let studentApplicationBlockedOnDraft = false;
  try {
    await applyToJobUseCase.execute("student_1", draftJob.id);
  } catch (err: any) {
    studentApplicationBlockedOnDraft = true;
  }
  assert(studentApplicationBlockedOnDraft, "Student application to draft job is rejected");

  console.log("\n--- Requirement 13: Application closing deadline remains separate from publication scheduling ---");
  let deadlineBeforeScheduleBlocked = false;
  try {
    await postJobUseCase.execute("company_A", {
      title: "Conflicted Dates Job",
      category: "Finance",
      openings: 1,
      minSalary: 50000,
      maxSalary: 60000,
      deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      publishOption: "schedule",
      scheduledPublishAt: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString()
    } as any);
  } catch (err: any) {
    deadlineBeforeScheduleBlocked = err.message.includes("deadline must be after the scheduled publication");
  }
  assert(deadlineBeforeScheduleBlocked, "Application deadline earlier than scheduled publication date is rejected");

  console.log("\n--- Requirement 14: Closed and expired jobs retain existing application-blocking behavior ---");
  const closedJob = await mockJobRepo.create(Job.create({
    companyId: "company_A",
    collegeId: "college_1",
    title: "Closed Role",
    category: "Engineering",
    openings: 1,
    deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000),
    type: "full-time" as any,
    status: JobStatus.CLOSED,
    salaryType: "per_month",
    minSalary: 50000,
    maxSalary: 60000,
    workMode: "on-site",
    interviewMode: "online",
    rounds: []
  }));

  let applicationToClosedBlocked = false;
  try {
    await applyToJobUseCase.execute("student_1", closedJob.id);
  } catch (err: any) {
    applicationToClosedBlocked = err.message.includes("closed");
  }
  assert(applicationToClosedBlocked, "Application to closed job is blocked");

  console.log("\n--- Requirement 15: Publish Now on Draft submits to review workflow ---");
  const draftForPublish = await postJobUseCase.execute("company_A", {
    title: "Ready Draft",
    category: "Product",
    collegeId: "college_1",
    openings: 2,
    deadline: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString(),
    minSalary: 90000,
    maxSalary: 110000,
    type: "full-time" as any,
    publishOption: "draft"
  } as any);

  const publishedFromDraft = await publishJobNowUseCase.execute(draftForPublish.id, "company_A");
  assert(publishedFromDraft.status === JobStatus.PENDING_REVIEW, "Publish Now transitions Draft to PENDING_REVIEW");
  assert(publishedFromDraft.isDraft() === false, "Job is no longer draft");

  console.log("==========================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runScheduledJobDraftWorkflowTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
