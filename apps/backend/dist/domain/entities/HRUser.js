"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRUser = void 0;
class HRUser {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new HRUser(props);
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
exports.HRUser = HRUser;
