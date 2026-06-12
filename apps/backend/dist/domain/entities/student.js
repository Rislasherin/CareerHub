"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = void 0;
class Student {
    constructor(_props) {
        this._props = _props;
    }
    static create(props) {
        return new Student(props);
    }
    get id() {
        return this._props.id;
    }
    get appliedJobs() {
        return this._props.appliedJobs || [];
    }
    get firstName() {
        return this._props.firstName;
    }
    get lastName() {
        return this._props.lastName;
    }
    get email() {
        return this._props.email;
    }
    get password() {
        return this._props.password;
    }
    get status() {
        return this._props.status;
    }
    get collegeId() {
        return this._props.collegeId;
    }
    get proofUrl() {
        return this._props.proofUrl;
    }
    get isFirstLogin() {
        return this._props.isFirstLogin;
    }
    get rollNumber() {
        return this._props.rollNumber;
    }
    get department() {
        return this._props.department;
    }
    get phoneNumber() {
        return this._props.phoneNumber;
    }
    get rejectReason() {
        return this._props.rejectReason;
    }
    get invitationToken() {
        return this._props.invitationToken;
    }
    get invitationExpiresAt() {
        return this._props.invitationExpiresAt;
    }
    // Profile get accessors
    get linkedinUrl() {
        return this._props.linkedinUrl;
    }
    get githubUrl() {
        return this._props.githubUrl;
    }
    get portfolioUrl() {
        return this._props.portfolioUrl;
    }
    get city() {
        return this._props.city;
    }
    get degree() {
        return this._props.degree;
    }
    get branch() {
        return this._props.branch;
    }
    get graduationYear() {
        return this._props.graduationYear;
    }
    get cgpa() {
        return this._props.cgpa;
    }
    get tenthPercentage() {
        return this._props.tenthPercentage;
    }
    get twelfthPercentage() {
        return this._props.twelfthPercentage;
    }
    get activeBacklogs() {
        return this._props.activeBacklogs;
    }
    get skills() {
        return this._props.skills;
    }
    get experience() {
        return this._props.experience;
    }
    get projects() {
        return this._props.projects;
    }
    get createdAt() {
        return this._props.createdAt;
    }
    get updatedAt() {
        return this._props.updatedAt;
    }
    toJSON() {
        return { ...this._props };
    }
}
exports.Student = Student;
