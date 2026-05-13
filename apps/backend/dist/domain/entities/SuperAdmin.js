"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdmin = void 0;
class SuperAdmin {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new SuperAdmin(props);
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
    get role() {
        return this.props.role;
    }
    get status() {
        return this.props.status;
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.SuperAdmin = SuperAdmin;
