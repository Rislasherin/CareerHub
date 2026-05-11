"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentManagementController = void 0;
const auth_error_1 = require("@application/errors/auth.error");
const message_constants_1 = require("@shared/constants/message.constants");
const http_status_constants_1 = require("@shared/constants/http-status.constants");
const asyncHandler_util_1 = require("@shared/utils/asyncHandler.util");
const response_util_1 = require("@shared/utils/response.util");
class StudentManagementController {
    constructor(createStudentUseCase, bulkUploadStudentsUseCase) {
        this.createStudentUseCase = createStudentUseCase;
        this.bulkUploadStudentsUseCase = bulkUploadStudentsUseCase;
        this.createStudent = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const organizationId = request.user?.organizationId;
            if (!organizationId) {
                throw new auth_error_1.UnauthorizedError();
            }
            const result = await this.createStudentUseCase.execute(organizationId, request.body);
            (0, response_util_1.sendSuccess)(response, result, message_constants_1.MESSAGE_CONSTANTS.STUDENT.CREATED, http_status_constants_1.HTTP_STATUS.CREATED);
        });
        this.bulkUpload = (0, asyncHandler_util_1.asyncHandler)(async (request, response) => {
            const organizationId = request.user?.organizationId;
            if (!organizationId) {
                throw new auth_error_1.UnauthorizedError();
            }
            const result = await this.bulkUploadStudentsUseCase.execute(organizationId, request.body);
            (0, response_util_1.sendSuccess)(response, result, message_constants_1.MESSAGE_CONSTANTS.STUDENT.BULK_UPLOAD_COMPLETED);
        });
    }
}
exports.StudentManagementController = StudentManagementController;
