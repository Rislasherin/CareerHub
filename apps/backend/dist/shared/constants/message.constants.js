"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MESSAGE_CONSTANTS = void 0;
exports.MESSAGE_CONSTANTS = {
    COMMON: {
        SUCCESS: "Request completed successfully.",
        VALIDATION_FAILED: "Validation failed.",
        UNAUTHORIZED: "You are not authorized to perform this action.",
        FORBIDDEN: "You do not have permission to access this resource.",
        NOT_FOUND: "The requested resource was not found.",
        INTERNAL_ERROR: "Something went wrong. Please try again later.",
        HEALTH_OK: "CareerHub backend is healthy.",
        LOGOUT_SUCCESS: "Logged out successfully.",
    },
    AUTH: {
        INVALID_CREDENTIALS: "Invalid email or password.",
        ACCOUNT_BLOCKED: "Your account is blocked. Please contact support.",
        ACCESS_TOKEN_MISSING: "Access token is missing.",
        REFRESH_TOKEN_MISSING: "Refresh token is missing.",
        REFRESH_TOKEN_INVALID: "Refresh token is invalid or expired.",
        FIRST_LOGIN_ONLY: "This action is allowed only for first login students.",
        PASSWORD_RESET_SENT: "If an account with this email exists, a reset link has been sent.",
        PASSWORD_RESET_SUCCESS: "Password has been reset successfully.",
        PASSWORD_SET_SUCCESS: "Password set successfully.",
        LOGIN_SUCCESS: "Login successful.",
        REFRESH_SUCCESS: "Session refreshed successfully.",
        SESSION_REVOKED: "Session revoked successfully.",
        TEMP_PASSWORD_SENT: "Temporary credentials sent successfully.",
    },
    SIGNUP: {
        COLLEGE_CREATED: "College account created successfully.",
        COMPANY_CREATED: "Company account created successfully.",
    },
    CONFLICT: {
        EMAIL_EXISTS: "Email is already registered.",
        ORGANIZATION_EXISTS: "Organization already exists.",
        COMPANY_EXISTS: "Company already exists.",
        ROLL_NUMBER_EXISTS: "Roll number is already registered for this college.",
    },
    STUDENT: {
        CREATED: "Student created successfully.",
        BULK_UPLOAD_COMPLETED: "Student CSV upload completed successfully.",
    },
    INTERVIEWER: {
        CREATED: "Interviewer created successfully.",
    },
};
