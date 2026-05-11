"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
exports.API_ROUTES = {
    HEALTH: "/health",
    AUTH: {
        BASE: "/auth",
        STUDENT_LOGIN: "/student/login",
        COLLEGE_ADMIN_LOGIN: "/college-admin/login",
        HR_LOGIN: "/hr/login",
        INTERVIEWER_LOGIN: "/interviewer/login",
        SUPER_ADMIN_LOGIN: "/super-admin/login",
        STUDENT_SET_PASSWORD: "/student/set-password",
        INTERVIEWER_SET_PASSWORD: "/interviewer/set-password",
        FORGOT_PASSWORD: "/forgot-password",
        RESET_PASSWORD: "/reset-password",
        REFRESH: "/refresh",
        LOGOUT: "/logout",
    },
    COLLEGE: {
        BASE: "/college",
        SIGNUP: "/signup",
    },
    COMPANY: {
        BASE: "/company",
        SIGNUP: "/signup",
    },
    COLLEGE_ADMIN: {
        BASE: "/college-admin",
        STUDENTS: "/students",
        STUDENT_BULK_UPLOAD: "/students/bulk-upload",
    },
    HR: {
        BASE: "/hr",
        INTERVIEWERS: "/interviewers",
    },
};
