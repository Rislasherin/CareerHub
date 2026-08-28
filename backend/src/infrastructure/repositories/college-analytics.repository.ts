import { ICollegeAnalyticsRepository, CollegeReportsAnalyticsDTO } from "@domain/repositories/ICollegeAnalyticsRepository";
import { StudentModel } from "@infrastructure/database/models/student/student.model";
import { JobApplicationModel } from "@infrastructure/database/models/jobApplication.model";
import { InterviewModel } from "@infrastructure/database/models/company/interview.model";
import { OfferModel } from "@infrastructure/database/models/company/offer.model";
import { UserStatus } from "@domain/enums/user.status.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { OfferStatus } from "@domain/enums/OfferStatus.enum";

export class CollegeAnalyticsRepository implements ICollegeAnalyticsRepository {
  async getCollegePlacementAnalytics(collegeId: string, startDate?: Date, endDate?: Date): Promise<CollegeReportsAnalyticsDTO> {
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = startDate;
      if (endDate) dateFilter.createdAt.$lte = endDate;
    }

    let updateDateFilter: any = {};
    if (startDate || endDate) {
      updateDateFilter.updatedAt = {};
      if (startDate) updateDateFilter.updatedAt.$gte = startDate;
      if (endDate) updateDateFilter.updatedAt.$lte = endDate;
    }

    // 1. Overview & Funnel: Students (We typically don't filter total students by date, but we can filter activities)
    const totalStudents = await StudentModel.countDocuments({
      collegeId,
      isDeleted: { $ne: true },
    });

    const eligibleStudentsCount = await StudentModel.countDocuments({
      collegeId,
      isDeleted: { $ne: true },
      status: { $in: [UserStatus.ACTIVE, UserStatus.PLACED, UserStatus.IN_PROCESS] },
    });

    const collegeStudents = await StudentModel.find({ collegeId, isDeleted: { $ne: true } }, { _id: 1, department: 1, status: 1 }).lean();
    const studentIds = collegeStudents.map(s => s._id);

    // 2. Funnel: Applied
    const appliedStudents = await JobApplicationModel.distinct("studentId", {
      studentId: { $in: studentIds },
      ...dateFilter
    });

    // 3. Funnel: Interviewed
    const interviewedStudents = await InterviewModel.distinct("studentId", {
      studentId: { $in: studentIds },
      ...dateFilter
    });

    // 4. Funnel: Offered
    const offeredStudents = await OfferModel.distinct("studentId", {
      studentId: { $in: studentIds },
      ...dateFilter
    });

    // 5. Funnel & Overview: Accepted
    const acceptedStudents = await OfferModel.distinct("studentId", {
      studentId: { $in: studentIds },
      status: OfferStatus.ACCEPTED,
      ...updateDateFilter
    });

    const placedStudents = acceptedStudents.length;
    const placementRate = eligibleStudentsCount > 0 ? (placedStudents / eligibleStudentsCount) * 100 : 0;

    const offersReceivedCount = await OfferModel.countDocuments({ studentId: { $in: studentIds }, ...dateFilter });
    const offersAcceptedCount = await OfferModel.countDocuments({ studentId: { $in: studentIds }, status: OfferStatus.ACCEPTED, ...updateDateFilter });

    // 6. Interviews Analytics
    const allInterviews = await InterviewModel.find({ studentId: { $in: studentIds }, isDeleted: { $ne: true }, ...dateFilter }, { status: 1 }).lean();
    let completedInterviews = 0;
    let upcomingInterviews = 0;
    let cancelledInterviews = 0;

    allInterviews.forEach(i => {
      if (i.status === InterviewStatus.COMPLETED) completedInterviews++;
      else if (i.status === InterviewStatus.CANCELLED) cancelledInterviews++;
      else upcomingInterviews++; // Scheduled, Waiting, etc.
    });

    const interviewCompletionRate = allInterviews.length > 0 ? (completedInterviews / allInterviews.length) * 100 : 0;

    // 7. Offers Analytics
    const allOffers = await OfferModel.find({ studentId: { $in: studentIds }, isDeleted: { $ne: true }, ...dateFilter }, { status: 1 }).lean();
    let acceptedCount = 0;
    let pendingCount = 0;
    let declinedCount = 0;

    allOffers.forEach(o => {
      if (o.status === OfferStatus.ACCEPTED) acceptedCount++;
      else if (o.status === OfferStatus.PENDING) pendingCount++;
      else if (o.status === OfferStatus.REJECTED || o.status === OfferStatus.EXPIRED) declinedCount++;
    });

    const offerAcceptanceRate = allOffers.length > 0 ? (acceptedCount / allOffers.length) * 100 : 0;

    // 8. Department Analytics
    const deptMap = new Map<string, { students: number; placed: number }>();
    collegeStudents.forEach(s => {
      const dept = s.department || 'Unassigned';
      if (!deptMap.has(dept)) deptMap.set(dept, { students: 0, placed: 0 });
      const deptStats = deptMap.get(dept)!;
      deptStats.students++;
      
      if (acceptedStudents.some(id => String(id) === String(s._id))) {
        deptStats.placed++;
      }
    });

    const departmentAnalytics = Array.from(deptMap.entries()).map(([department, stats]) => ({
      department,
      students: stats.students,
      placed: stats.placed,
      placementRate: stats.students > 0 ? (stats.placed / stats.students) * 100 : 0
    }));

    // 9. Student Placement Status Breakdown
    const statusMap = new Map<string, number>();
    collegeStudents.forEach(s => {
      const st = s.status || 'UNKNOWN';
      statusMap.set(st, (statusMap.get(st) || 0) + 1);
    });

    const studentPlacementStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status, count
    }));

    // 10. Placement Trend (Mocked or derived from Offers timeline if available)
    const acceptedOffersDetails = await OfferModel.find({ 
      studentId: { $in: studentIds }, 
      status: OfferStatus.ACCEPTED,
      ...updateDateFilter
    }, { updatedAt: 1 }).lean();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendMap = new Map<string, number>();
    
    acceptedOffersDetails.forEach(o => {
      if (o.updatedAt) {
        const date = new Date(o.updatedAt);
        const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        trendMap.set(label, (trendMap.get(label) || 0) + 1);
      }
    });

    let placementTrend = Array.from(trendMap.entries()).map(([label, value]) => ({ label, value }));
    if (placementTrend.length === 0) {
      placementTrend = [{ label: "No Data", value: 0 }];
    }

    return {
      overview: {
        totalStudents,
        eligibleStudents: eligibleStudentsCount,
        placedStudents,
        placementRate,
        offersReceived: offersReceivedCount,
        offersAccepted: offersAcceptedCount
      },
      placementTrend,
      funnel: {
        eligible: eligibleStudentsCount,
        applied: appliedStudents.length,
        interviewed: interviewedStudents.length,
        offered: offeredStudents.length,
        accepted: acceptedStudents.length
      },
      interviews: {
        total: allInterviews.length,
        completed: completedInterviews,
        upcoming: upcomingInterviews,
        cancelled: cancelledInterviews,
        completionRate: interviewCompletionRate
      },
      offers: {
        total: allOffers.length,
        accepted: acceptedCount,
        pending: pendingCount,
        declined: declinedCount,
        acceptanceRate: offerAcceptanceRate
      },
      departmentAnalytics,
      studentPlacementStatus
    };
  }
}
