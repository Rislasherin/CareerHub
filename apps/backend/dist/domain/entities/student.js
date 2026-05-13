"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = void 0;
class Student {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Student(props);
    }
    get id() {
        return this.props.id;
    }
    get firstName() {
        return this.props.firstName;
    }
    get lastName() {
        return this.props.lastName;
    }
    get email() {
        return this.props.email;
    }
    get password() {
        return this.props.password;
    }
    get status() {
        return this.props.status;
    }
    get collegeId() {
        return this.props.collegeId;
    }
    get proofUrl() {
        return this.props.proofUrl;
    }
    get isFirstLogin() {
        return this.props.isFirstLogin;
    }
    get rollNumber() {
        return this.props.rollNumber;
    }
    get department() {
        return this.props.department;
    }
    get phoneNumber() {
        return this.props.phoneNumber;
    }
    get invitationToken() {
        return this.props.invitationToken;
    }
    get invitationExpiresAt() {
        return this.props.invitationExpiresAt;
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.Student = Student;
