"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interviewer = void 0;
class Interviewer {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Interviewer(props);
    }
    get id() {
        return this.props.id;
    }
    get companyId() {
        return this.props.companyId;
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
    get designation() {
        return this.props.designation;
    }
    get specialization() {
        return this.props.specialization;
    }
    get role() {
        return this.props.role;
    }
    get status() {
        return this.props.status;
    }
    set status(value) {
        this.props.status = value;
    }
    get isDeleted() {
        return this.props.isDeleted;
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.Interviewer = Interviewer;
