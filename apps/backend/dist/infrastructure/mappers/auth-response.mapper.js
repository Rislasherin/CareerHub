"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuthUserResponse = void 0;
const toAuthUserResponse = (account) => ({
    id: account.getId(),
    role: account.getRole(),
    email: account.getEmail(),
    firstName: account.getFirstName(),
    lastName: account.getLastName(),
    fullName: account.getFullName(),
    designation: account.getDesignation(),
    organizationId: account.getOrganizationId(),
    comptypeId: account.getComptypeId(),
    branch: account.getBranch(),
    cgpa: account.getCgpa(),
    rollNumber: account.getRollNumber(),
    isFirstLogin: account.isFirstLogin(),
});
exports.toAuthUserResponse = toAuthUserResponse;
