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

        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0
            }).format(amount);
        };

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                        body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #1e293b; padding: 48px; margin: 0; box-sizing: border-box; }
                        .container { max-width: 48rem; margin: 0 auto; }
                        .text-center { text-align: center; }
                        .mb-10 { margin-bottom: 2.5rem; }
                        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
                        .font-black { font-weight: 900; }
                        .text-slate-900 { color: #0f172a; }
                        .text-xs { font-size: 0.75rem; line-height: 1rem; }
                        .uppercase { text-transform: uppercase; }
                        .tracking-widest { letter-spacing: 0.1em; }
                        .text-slate-500 { color: #64748b; }
                        .font-bold { font-weight: 700; }
                        .mt-2 { margin-top: 0.5rem; }
                        .space-y-6 > * + * { margin-top: 1.5rem; }
                        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                        .leading-relaxed { line-height: 1.625; }
                        .text-slate-800 { color: #1e293b; }
                        .font-semibold { font-weight: 600; }
                        .bg-slate-50 { background-color: #f8fafc; }
                        .border { border-width: 1px; border-style: solid; }
                        .border-slate-200 { border-color: #e2e8f0; }
                        .rounded-2xl { border-radius: 1rem; }
                        .p-6 { padding: 1.5rem; }
                        .my-8 { margin-top: 2rem; margin-bottom: 2rem; }
                        
                        /* Grid fallback using flexbox */
                        .grid-2 { display: flex; flex-wrap: wrap; margin-top: -1.5rem; margin-left: -2rem; }
                        .grid-2 > div { width: 50%; padding-top: 1.5rem; padding-left: 2rem; box-sizing: border-box; }
                        
                        .block { display: block; }
                        .text-10px { font-size: 10px; }
                        .mb-1 { margin-bottom: 0.25rem; }
                        .text-base { font-size: 1rem; line-height: 1.5rem; }
                        .text-slate-600 { color: #475569; }
                        
                        /* Flexbox for footer */
                        .flex-between { display: flex; justify-content: space-between; }
                        .mt-16 { margin-top: 4rem; }
                        .pt-8 { padding-top: 2rem; }
                        .border-t { border-top-width: 1px; border-top-style: solid; border-top-color: #e2e8f0; }
                        .font-medium { font-weight: 500; }
                        .text-right { text-align: right; }
                        .flex-col-end { display: flex; flex-direction: column; align-items: flex-end; }
                        .mb-2 { margin-bottom: 0.5rem; }
                        .sig-box { width: 12rem; height: 5rem; border: 1px solid #e2e8f0; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center; padding: 0.5rem; background-color: #f8fafc; }
                        .sig-img { max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="text-center mb-10">
                            <h2 class="text-3xl font-black text-slate-900">${company.name}</h2>
                            <p class="text-xs uppercase tracking-widest text-slate-500 font-bold mt-2">Offer of Employment &bull; Confidential</p>
                        </div>

                        <div class="space-y-6 text-sm leading-relaxed text-slate-800">
                            <p class="font-semibold text-slate-900">${new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            
                            <p>Dear <strong class="text-slate-900">${student.firstName} ${student.lastName}</strong>,</p>
                            
                            <p>
                                We are pleased to extend an offer of employment for the position of <strong class="text-slate-900">${offer.role}</strong> at ${company.name}. 
                                You have successfully completed our selection process and we believe you will be an excellent addition to our team.
                            </p>

                            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-8">
                                <div class="grid-2">
                                    <div>
                                        <span class="text-slate-500 font-semibold block text-10px uppercase tracking-widest mb-1">Role</span>
                                        <span class="font-black text-slate-900 text-base">${offer.role}</span>
                                    </div>
                                    <div>
                                        <span class="text-slate-500 font-semibold block text-10px uppercase tracking-widest mb-1">CTC (Annual)</span>
                                        <span class="font-black text-slate-900 text-base">${formatCurrency(offer.ctc)}</span>
                                    </div>
                                    <div>
                                        <span class="text-slate-500 font-semibold block text-10px uppercase tracking-widest mb-1">Joining Date</span>
                                        <span class="font-black text-slate-900 text-base">${new Date(offer.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div>
                                        <span class="text-slate-500 font-semibold block text-10px uppercase tracking-widest mb-1">Location</span>
                                        <span class="font-black text-slate-900 text-base">Bangalore - Hybrid</span>
                                    </div>
                                </div>
                            </div>

                            <p class="text-slate-600">
                                This offer is contingent upon successful completion of background verification and document submission prior to your joining date.
                            </p>
                            <p class="text-slate-600">
                                Please confirm your acceptance by <strong class="text-slate-900">${new Date(offer.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>. We look forward to welcoming you!
                            </p>

                            <div class="flex-between mt-16 pt-8 border-t">
                                <div class="text-xs text-slate-500 font-medium">
                                    HR Manager &bull; ${company.name}
                                </div>
                                <div class="text-xs text-slate-500 font-medium text-right flex-col-end">
                                    <span class="mb-2">Candidate Acceptance Signature</span>
                                    ${offer.signatureUrl ? `<div class="sig-box"><img src="${offer.signatureUrl}" alt="Signature" class="sig-img" /></div>` : ''}
                                </div>
                            </div>
                        </div>
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
