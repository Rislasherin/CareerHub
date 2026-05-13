"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollegeAdmin = void 0;
class CollegeAdmin {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new CollegeAdmin(props);
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
    get orgId() {
        return this.props.orgId;
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
    toJSON() {
        return { ...this.props };
    }
}
exports.CollegeAdmin = CollegeAdmin;
