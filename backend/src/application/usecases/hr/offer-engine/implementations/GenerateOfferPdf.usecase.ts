import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import puppeteer from 'puppeteer';
import { IGenerateOfferPdfUseCase } from "../interfaces/IGenerateOfferPdf.usecase";

export class GenerateOfferPdfUseCase implements IGenerateOfferPdfUseCase {
    constructor(
        private readonly _offerRepository: IOfferRepository,
        private readonly _studentRepository: IStudentRepository,
        private readonly _companyRepository: ICompanyRepository
    ) {}

    async execute(offerId: string): Promise<Buffer> {
        const offer = await this._offerRepository.findById(offerId);
        if (!offer) {
            throw new AppError("Offer not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        const student = await this._studentRepository.findById(offer.studentId);
        const company = await this._companyRepository.findById(offer.companyId);

        if (!student || !company) {
            throw new AppError("Student or Company not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
                        h1 { color: #4F46E5; margin-bottom: 5px; }
                        .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
                        .footer { margin-top: 60px; font-size: 12px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                        .content { max-width: 800px; margin: 0 auto; }
                        .highlight { font-weight: bold; color: #111; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${company.name}</h1>
                        <p style="color: #666; font-size: 14px;">Official Offer of Employment</p>
                    </div>
                    <div class="content">
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <br/>
                        <p>Dear <span class="highlight">${student.firstName} ${student.lastName}</span>,</p>
                        <p>We are absolutely thrilled to officially offer you the position of <span class="highlight">${offer.role}</span> at ${company.name}. We were extremely impressed by your skills and believe you will be a fantastic addition to our team.</p>
                        
                        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
                            <h3 style="margin-top: 0; color: #334155;">Offer Details:</h3>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="margin-bottom: 10px;"><strong>Position:</strong> ${offer.role}</li>
                                <li style="margin-bottom: 10px;"><strong>Total Compensation (CTC):</strong> ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(offer.ctc)} per year</li>
                                <li style="margin-bottom: 10px;"><strong>Expected Joining Date:</strong> ${new Date(offer.joiningDate).toLocaleDateString()}</li>
                            </ul>
                        </div>

                        <p>Please review this offer letter and indicate your acceptance before <span class="highlight">${new Date(offer.expiresAt).toLocaleDateString()}</span>.</p>
                        <p>If you have any questions, please do not hesitate to reach out to us.</p>
                        
                        <br/><br/>
                        <p>Sincerely,</p>
                        <p><span class="highlight">Human Resources</span><br/>${company.name}</p>
                    </div>
                    <div class="footer">
                        <p>This is a digitally generated and securely tracked document by CareerHub. No physical signature is required.</p>
                    </div>
                </body>
            </html>
        `;

        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfArray = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
        await browser.close();

        return Buffer.from(pdfArray);
    }
}
