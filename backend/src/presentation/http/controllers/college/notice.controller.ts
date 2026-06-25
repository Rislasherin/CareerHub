import { Request, Response } from "express";
import { NoticeRequestDto } from "@application/dtos/college/Request/notice.request.dto";
import { ICreateNoticeUseCase } from "@application/usecases/college/notices/interfaces/ICreateNotice.usecase";
import { IGetCollegeNoticesUseCase } from "@application/usecases/college/notices/interfaces/IGetCollegeNotices.usecase";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IDeleteNoticeUseCase } from "@application/usecases/college/notices/interfaces/IDeleteNotice.usecase";
import { IUpdateNoticeUseCase } from "@application/usecases/college/notices/interfaces/IUpdateNotice.usecase";

export class NoticeController {
    constructor(
        private readonly _createNoticeUseCase: ICreateNoticeUseCase,
        private readonly _getCollegeNoticeUseCase: IGetCollegeNoticesUseCase,
        private readonly _deleteNoticeUseCase: IDeleteNoticeUseCase,
        private readonly _updateNoticeUseCase: IUpdateNoticeUseCase,
    ){}

    createNotice = asyncHandler(async (req: Request, res: Response) => {
        const collegeId = req.user?.orgId || req.user?.id; // Must use orgId to match student's collegeId
        
        if (!collegeId) {
            throw new AppError("College ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const dto: NoticeRequestDto = req.body; // Fixed typo here (used to be '= NoticeRequestDto =')
        const notice = await this._createNoticeUseCase.execute(collegeId, dto);

        sendSuccess(res, notice, "Notice Board Created Successfully"); // Pass 'notice' instead of 'null'
    });

    getNotices = asyncHandler(async (req: Request, res: Response) => {
        const collegeId = req.user?.orgId || req.user?.id;
        
        if (!collegeId) {
            throw new AppError("College ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const notices = await this._getCollegeNoticeUseCase.execute(collegeId);

        sendSuccess(res, notices, "Notices Retrieved Successfully");
    });

    updateNotice = asyncHandler(async(req: Request, res: Response) => {
        const collegeId = req.user?.orgId || req.user?.id;
        
        if (!collegeId) {
            throw new AppError("College ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const noticeId = req.params.id;
        const notice = await this._updateNoticeUseCase.execute(collegeId, noticeId, req.body);
        sendSuccess(res, notice, "Notice Updated Successfully");
    });

    deleteNotice = asyncHandler(async(req: Request, res: Response) => {
        const collegeId = req.user?.orgId || req.user?.id;
        
        if (!collegeId) {
            throw new AppError("College ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const noticeId = req.params.id;
        await this._deleteNoticeUseCase.execute(collegeId, noticeId);
        sendSuccess(res, null, "Notice Deleted Successfully");
    });
}