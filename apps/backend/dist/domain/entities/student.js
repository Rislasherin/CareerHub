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
    get email() {
        return this.props.email;
    }
    get password() {
        return this.props.password;
    }
    get status() {
        return this.props.status;
    }
    get isFirstLogin() {
        return this.props.isFirstLogin;
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.Student = Student;
