"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
class Company {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Company(props);
    }
    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get sector() {
        return this.props.sector;
    }
    get size() {
        return this.props.size;
    }
    get location() {
        return this.props.location;
    }
    get contactName() {
        return this.props.contactName;
    }
    get contactEmail() {
        return this.props.contactEmail;
    }
    get contactPhone() {
        return this.props.contactPhone;
    }
    get onboardingStep() {
        return this.props.onboardingStep;
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
exports.Company = Company;
