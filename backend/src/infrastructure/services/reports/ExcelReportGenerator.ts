import { ICollegeReportGenerator } from "@domain/services/ICollegeReportGenerator";
import { CollegeReportsAnalyticsDTO } from "@domain/repositories/ICollegeAnalyticsRepository";
import { Logger } from "@infrastructure/logger/logger";
import ExcelJS from "exceljs";

export class ExcelReportGenerator implements ICollegeReportGenerator {
  async generate(data: CollegeReportsAnalyticsDTO, collegeName: string = 'College'): Promise<Buffer> {
    Logger.info("Generating Excel report...");
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CareerHub';
    workbook.created = new Date();

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 15 }
    ];
    
    // Style headers
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    summarySheet.addRows([
      { metric: 'Total Students', value: data.overview.totalStudents },
      { metric: 'Eligible Students', value: data.overview.eligibleStudents || 0 },
      { metric: 'Placed Students', value: data.overview.placedStudents },
      { metric: 'Placement Rate (%)', value: data.overview.placementRate ? data.overview.placementRate.toFixed(2) : 0 },
      { metric: 'Offers Received', value: data.overview.offersReceived },
      { metric: 'Offers Accepted', value: data.overview.offersAccepted },
      { metric: 'Total Interviews', value: data.interviews.total },
      { metric: 'Interview Completion Rate (%)', value: data.interviews.completionRate ? data.interviews.completionRate.toFixed(2) : 0 },
    ]);

    // Sheet 2: Placement Funnel
    const funnelSheet = workbook.addWorksheet('Funnel');
    funnelSheet.columns = [
      { header: 'Stage', key: 'stage', width: 25 },
      { header: 'Count', key: 'count', width: 15 }
    ];
    funnelSheet.getRow(1).font = { bold: true };
    funnelSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    
    funnelSheet.addRows([
      { stage: 'Eligible', count: data.funnel.eligible || 0 },
      { stage: 'Applied', count: data.funnel.applied || 0 },
      { stage: 'Interviewed', count: data.funnel.interviewed || 0 },
      { stage: 'Offered', count: data.funnel.offered || 0 },
      { stage: 'Accepted', count: data.funnel.accepted || 0 },
    ]);

    // Sheet 3: Department Analytics (if available)
    if (data.departmentAnalytics && data.departmentAnalytics.length > 0) {
      const deptSheet = workbook.addWorksheet('Departments');
      deptSheet.columns = [
        { header: 'Department', key: 'dept', width: 30 },
        { header: 'Total Students', key: 'students', width: 20 },
        { header: 'Placed', key: 'placed', width: 20 },
        { header: 'Placement Rate (%)', key: 'rate', width: 20 }
      ];
      deptSheet.getRow(1).font = { bold: true };
      deptSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

      data.departmentAnalytics.forEach(dept => {
        deptSheet.addRow({
          dept: dept.department,
          students: dept.students,
          placed: dept.placed,
          rate: dept.placementRate ? Number(dept.placementRate.toFixed(2)) : 0
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
