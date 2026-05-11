import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IActivateInterviewerUseCase } from "@application/usecases/auth/interviewer/implementations/ActivateInterviewer.usecase";

export class InterviewerAuthController {
  constructor(private readonly activateUseCase: IActivateInterviewerUseCase) {}

  activate = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const interviewerId = req.user.id;
    const { password } = req.body;
    await this.activateUseCase.execute(interviewerId, password);
    sendSuccess(res, null, "Account activated successfully. You can now login.");
  });
}
