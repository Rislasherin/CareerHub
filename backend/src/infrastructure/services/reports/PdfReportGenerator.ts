import { ICollegeReportGenerator } from "@domain/services/ICollegeReportGenerator";
import { CollegeReportsAnalyticsDTO } from "@domain/repositories/ICollegeAnalyticsRepository";
import { puppeteerPool } from "../pdf/PuppeteerPool";
import { Logger } from "@infrastructure/logger/logger";
import { Page } from "puppeteer";

export class PdfReportGenerator implements ICollegeReportGenerator {
  async generate(data: CollegeReportsAnalyticsDTO, collegeName: string = 'College'): Promise<Buffer> {
    Logger.info("Generating PDF report...");
    
    // Minimal, professional HTML template for the report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Placement Report - ${collegeName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; margin: 40px; }
          h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
          h2 { color: #1e293b; margin-top: 30px; }
          .summary-grid { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; flex: 1; min-width: 150px; text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #10b981; }
          .summary-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: 600; color: #475569; }
          .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Placement Report</h1>
        <p><strong>College:</strong> ${collegeName}</p>
        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>Executive Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-value">${data.overview.totalStudents}</div>
            <div class="summary-label">Total Students</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${data.overview.placedStudents}</div>
            <div class="summary-label">Placed Students</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${data.overview.placementRate ? data.overview.placementRate.toFixed(1) + '%' : '0%'}</div>
            <div class="summary-label">Placement Rate</div>
          </div>
        </div>

        <h2>Placement Funnel</h2>
        <table>
          <tr><th>Stage</th><th>Count</th></tr>
          <tr><td>Eligible</td><td>${data.funnel.eligible || 0}</td></tr>
          <tr><td>Applied</td><td>${data.funnel.applied || 0}</td></tr>
          <tr><td>Interviewed</td><td>${data.funnel.interviewed || 0}</td></tr>
          <tr><td>Offered</td><td>${data.funnel.offered || 0}</td></tr>
          <tr><td>Accepted</td><td>${data.funnel.accepted || 0}</td></tr>
        </table>

        <h2>Offers & Interviews</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-value">${data.offers.total}</div>
            <div class="summary-label">Total Offers</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${data.offers.acceptanceRate ? data.offers.acceptanceRate.toFixed(1) + '%' : '0%'}</div>
            <div class="summary-label">Offer Acceptance Rate</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${data.interviews.total}</div>
            <div class="summary-label">Total Interviews</div>
          </div>
        </div>

        ${data.departmentAnalytics && data.departmentAnalytics.length > 0 ? `
          <h2>Department Analytics</h2>
          <table>
            <tr><th>Department</th><th>Students</th><th>Placed</th><th>Placement Rate</th></tr>
            ${data.departmentAnalytics.map(dept => `
              <tr>
                <td>${dept.department}</td>
                <td>${dept.students}</td>
                <td>${dept.placed}</td>
                <td>${dept.placementRate.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}

        <div class="footer">
          Generated securely by CareerHub &bull; Tenant ID restricted
        </div>
      </body>
      </html>
    `;

    return puppeteerPool.execute(async (page: Page) => {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });
      return Buffer.from(pdfBuffer);
    });
  }
}
