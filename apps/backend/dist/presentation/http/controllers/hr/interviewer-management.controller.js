"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerManagementController = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const message_constants_1 = require("@shared/constants/message.constants");
const http_status_constants_1 = require("@shared/constants/http-status.constants");
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class InterviewerManagementController {
    constructor(createInterviewerUseCase) {
        this.createInterviewerUseCase = createInterviewerUseCase;
        this.createInterviewer = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const comptypeId = request.user?.comptypeId;
            if (!comptypeId) {
                throw new auth_error_1.UnauthorizedError();
            }
            const result = await this.createInterviewerUseCase.execute(comptypeId, request.body);
            (0, response_util_1.sendSuccess)(response, result, message_constants_1.MESSAGE_CONSTANTS.INTERVIEWER.CREATED, http_status_constants_1.HTTP_STATUS.CREATED);
        });
    }
}
exports.InterviewerManagementController = InterviewerManagementController;
