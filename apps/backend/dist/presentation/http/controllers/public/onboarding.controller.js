"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingController = void 0;
const message_constants_1 = require("@shared/constants/message.constants");
const http_status_constants_1 = require("@shared/constants/http-status.constants");
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class OnboardingController {
    constructor(collegeSignupUseCase, comptypeSignupUseCase) {
        this.collegeSignupUseCase = collegeSignupUseCase;
        this.comptypeSignupUseCase = comptypeSignupUseCase;
        this.collegeSignup = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const result = await this.collegeSignupUseCase.execute(request.body);
            (0, response_util_1.sendSuccess)(response, result, message_constants_1.MESSAGE_CONSTANTS.SIGNUP.COLLEGE_CREATED, http_status_constants_1.HTTP_STATUS.CREATED);
        });
        this.comptypeSignup = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const result = await this.comptypeSignupUseCase.execute(request.body);
            (0, response_util_1.sendSuccess)(response, result, message_constants_1.MESSAGE_CONSTANTS.SIGNUP.COMPtype_CREATED, http_status_constants_1.HTTP_STATUS.CREATED);
        });
    }
}
exports.OnboardingController = OnboardingController;
