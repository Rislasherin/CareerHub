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
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                        body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #1e293b; padding: 48px; }
                        /* Tailwind colors override just in case */
                        .text-slate-900 { color: #0f172a; }
                        .text-slate-800 { color: #1e293b; }
                        .text-slate-600 { color: #475569; }
                        .text-slate-500 { color: #64748b; }
                        .bg-slate-50 { background-color: #f8fafc; }
                        .border-slate-200 { border-color: #e2e8f0; }
                    </style>
                </head>
                <body>
                    <div class="max-w-3xl mx-auto">
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

                            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-8 grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                <div>
                                    <span class="text-slate-500 font-semibold block text-[10px] uppercase tracking-widest mb-1">Role</span>
                                    <span class="font-black text-slate-900 text-base">${offer.role}</span>
                                </div>
                                <div>
                                    <span class="text-slate-500 font-semibold block text-[10px] uppercase tracking-widest mb-1">CTC (Annual)</span>
                                    <span class="font-black text-slate-900 text-base">${formatCurrency(offer.ctc)}</span>
                                </div>
                                <div>
                                    <span class="text-slate-500 font-semibold block text-[10px] uppercase tracking-widest mb-1">Joining Date</span>
                                    <span class="font-black text-slate-900 text-base">${new Date(offer.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div>
                                    <span class="text-slate-500 font-semibold block text-[10px] uppercase tracking-widest mb-1">Location</span>
                                    <span class="font-black text-slate-900 text-base">Bangalore - Hybrid</span>
                                </div>
                            </div>

                            <p class="text-slate-600">
                                This offer is contingent upon successful completion of background verification and document submission prior to your joining date.
                            </p>
                            <p class="text-slate-600">
                                Please confirm your acceptance by <strong class="text-slate-900">${new Date(offer.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>. We look forward to welcoming you!
                            </p>

                            <div class="flex justify-between mt-16 pt-8 border-t border-slate-200">
                                <div class="text-xs text-slate-500 font-medium">
                                    HR Manager &bull; ${company.name}
                                </div>
                                <div class="text-xs text-slate-500 font-medium text-right flex flex-col items-end">
                                    <span class="mb-2">Candidate Acceptance Signature</span>
                                    ${offer.signatureUrl ? `<div class="w-48 h-20 border border-slate-200 rounded flex items-center justify-center p-2 bg-slate-50"><img src="${offer.signatureUrl}" alt="Signature" class="max-w-full max-h-full object-contain mix-blend-multiply" /></div>` : ''}
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
