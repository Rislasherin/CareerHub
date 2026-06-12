"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdmin = void 0;
class SuperAdmin {
    constructor(_props) {
        this._props = _props;
    }
    static create(props) {
        return new SuperAdmin(props);
    }
    get id() {
        return this._props.id;
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
    get role() {
        return this._props.role;
    }
    get status() {
        return this._props.status;
    }
    toJSON() {
        return { ...this._props };
    }
}
exports.SuperAdmin = SuperAdmin;
