import { ICollegeReportGenerator } from "@domain/services/ICollegeReportGenerator";
import { CollegeReportsAnalyticsDTO } from "@domain/repositories/ICollegeAnalyticsRepository";
import { Logger } from "@infrastructure/logger/logger";

export class CsvReportGenerator implements ICollegeReportGenerator {
  async generate(data: CollegeReportsAnalyticsDTO, collegeName: string = 'College'): Promise<Buffer> {
    Logger.info("Generating CSV report...");
    
    const rows: string[] = [];
    
    // Helper to escape CSV values
    const escape = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Header section
    rows.push(`College Name,${escape(collegeName)}`);
    rows.push(`Generated On,${escape(new Date().toISOString())}`);
    rows.push('');
    
    // Overview Section
    rows.push('--- OVERVIEW ---');
    rows.push('Metric,Value');
    rows.push(`Total Students,${escape(data.overview.totalStudents)}`);
    rows.push(`Eligible Students,${escape(data.overview.eligibleStudents)}`);
    rows.push(`Placed Students,${escape(data.overview.placedStudents)}`);
    rows.push(`Placement Rate (%),${escape(data.overview.placementRate ? data.overview.placementRate.toFixed(2) : 0)}`);
    rows.push(`Offers Received,${escape(data.overview.offersReceived)}`);
    rows.push(`Offers Accepted,${escape(data.overview.offersAccepted)}`);
    rows.push('');

    // Funnel Section
    rows.push('--- PLACEMENT FUNNEL ---');
    rows.push('Stage,Count');
    rows.push(`Eligible,${escape(data.funnel.eligible)}`);
    rows.push(`Applied,${escape(data.funnel.applied)}`);
    rows.push(`Interviewed,${escape(data.funnel.interviewed)}`);
    rows.push(`Offered,${escape(data.funnel.offered)}`);
    rows.push(`Accepted,${escape(data.funnel.accepted)}`);
    rows.push('');

    // Interviews & Offers
    rows.push('--- INTERVIEWS ---');
    rows.push('Metric,Count');
    rows.push(`Total Scheduled,${escape(data.interviews.total)}`);
    rows.push(`Completed,${escape(data.interviews.completed)}`);
    rows.push(`Upcoming,${escape(data.interviews.upcoming)}`);
    rows.push(`Cancelled,${escape(data.interviews.cancelled)}`);
    rows.push(`Completion Rate (%),${escape(data.interviews.completionRate ? data.interviews.completionRate.toFixed(2) : 0)}`);
    rows.push('');

    // Department Analytics
    if (data.departmentAnalytics && data.departmentAnalytics.length > 0) {
      rows.push('--- DEPARTMENT ANALYTICS ---');
      rows.push('Department,Total Students,Placed Students,Placement Rate (%)');
      data.departmentAnalytics.forEach(dept => {
        rows.push(`${escape(dept.department)},${escape(dept.students)},${escape(dept.placed)},${escape(dept.placementRate ? dept.placementRate.toFixed(2) : 0)}`);
      });
      rows.push('');
    }

    const csvContent = rows.join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }
}
