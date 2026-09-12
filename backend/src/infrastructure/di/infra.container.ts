import { StudentRepository } from "@infrastructure/repositories/student.repository";
import { SuperAdminRepository } from "@infrastructure/repositories/SuperAdminRepository";
import { CompanyRepository } from "@infrastructure/repositories/CompanyRepository";
import { HRUserRepository } from "@infrastructure/repositories/HRUserRepository";

import { OtpRepository } from "@infrastructure/repositories/OtpRepository";
import { CollegeAdminRepository } from "@infrastructure/repositories/college-admin.repository";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { JobRepository } from "@infrastructure/repositories/JobRepository";
import { BcryptService } from "@infrastructure/services/hash/bcrypt.service";
import { JwtService } from "@infrastructure/services/token/jwt.service";
import { AuthMiddleware } from "@presentation/express/middlewares/auth.middleware";
import { CrossRoleAuthService } from "@application/services/CrossRoleAuthService";
import { NoticeRepository } from "@infrastructure/repositories/NoticeRepository";
import { JobApplicationRepository } from "@infrastructure/repositories/jobApplication.repository";
import { InterviewRepository } from "@infrastructure/repositories/interview.repository";
import { OfferRepository } from "@infrastructure/repositories/offer.repository";

import { NotificationModel } from "@infrastructure/database/models/common/notification.model";
import { PlanModel } from "@infrastructure/database/models/organizer/plan.model";
import { PaymentModel } from "@infrastructure/database/models/organizer/payment.model";
import { InvoiceModel } from "@infrastructure/database/models/organizer/invoice.model";
import { AIUsageRecordModel } from "@infrastructure/database/models/ai/aiUsageRecord.model";
import { NotificationRepository } from "@infrastructure/repositories/notification.repository";
import { PlanRepository } from "@infrastructure/repositories/plan.repository";
import { PaymentRepository } from "@infrastructure/repositories/payment.repository";
import { InvoiceRepository } from "@infrastructure/repositories/invoice.repository";
import { AIUsageRepository } from "@infrastructure/repositories/aiUsage.repository";
import { CreateSystemNotificationUseCase } from "@application/usecases/common/notifications/implementations/CreateSystemNotification.usecase";
import { SubscriptionRepository } from "@infrastructure/repositories/subscription.repository";
import { RazorpayGateway } from "@infrastructure/services/payment/RazorpayGateway.payment";
import { GetCollegeSubscriptionUseCase } from "@application/usecases/college/implementations/GetCollegeSubscription.usecase";

import { AIInterviewRepository } from "@infrastructure/repositories/ai-interview.repository";
import { AIInterviewEvaluationRepository } from "@infrastructure/repositories/ai-interview-evaluation.repository";
import { MongoInterviewIntegrityEventRepository } from "@infrastructure/repositories/ai-interview/MongoInterviewIntegrityEventRepository";

export const notificationRepository = new NotificationRepository(NotificationModel);
import { AICreditService } from "@infrastructure/services/ai-practice/AICreditService";

import { EntitlementGuardService } from "@infrastructure/services/entitlements/EntitlementGuardService";

export const studentRepository = new StudentRepository();
export const superAdminRepository = new SuperAdminRepository();

export const planRepository = new PlanRepository(PlanModel);
export const paymentRepository = new PaymentRepository(PaymentModel);
export const invoiceRepository = new InvoiceRepository(InvoiceModel);
export const aiUsageRepository = new AIUsageRepository(AIUsageRecordModel);
export const subscriptionRepository = new SubscriptionRepository();
export const aiCreditService = new AICreditService(aiUsageRepository, subscriptionRepository);
export const otpRepository = new OtpRepository();
export const collegeAdminRepository = new CollegeAdminRepository();
export const organizationRepository = new OrganizationRepository();
export const entitlementGuardService = new EntitlementGuardService(subscriptionRepository, planRepository, studentRepository, organizationRepository);
export const createSystemNotificationUseCase = new CreateSystemNotificationUseCase(notificationRepository);
export const companyRepository = new CompanyRepository();
export const hrUserRepository = new HRUserRepository();

export const noticeRepository = new NoticeRepository()
export const jobRepository = new JobRepository();
export const jobApplicationRepository = new JobApplicationRepository();
export const jwtService = new JwtService();
export const bcryptService = new BcryptService();
export const offerRepository = new OfferRepository();
export const getCollegeSubscriptionUseCase = new GetCollegeSubscriptionUseCase();
export const authMiddleware = new AuthMiddleware(
    jwtService,
    studentRepository,
    hrUserRepository,

    collegeAdminRepository,
    superAdminRepository,
    organizationRepository,
    companyRepository,
    subscriptionRepository
);
export const crossRoleAuthService = new CrossRoleAuthService(
    studentRepository,
    hrUserRepository,

    collegeAdminRepository,
    superAdminRepository
);

export const interviewRepository = new InterviewRepository();
export const paymentGateway = new RazorpayGateway();

import { CollegeAnalyticsRepository } from "@infrastructure/repositories/college-analytics.repository";
export const collegeAnalyticsRepository = new CollegeAnalyticsRepository();

// ─── AI Interview Infrastructure ──────────────────────────────────────────────
export const aiInterviewRepository = new AIInterviewRepository();
export const aiInterviewEvaluationRepository = new AIInterviewEvaluationRepository();
export const interviewIntegrityEventRepository = new MongoInterviewIntegrityEventRepository();
