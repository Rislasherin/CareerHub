"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
class Organization {
    constructor(_props) {
        this._props = _props;
    }
    static create(props) {
        return new Organization(props);
    }
    get id() {
        return this._props.id;
    }
    get name() {
        return this._props.name;
    }
    get city() {
        return this._props.city;
    }
    get state() {
        return this._props.state;
    }
    get studentCountRange() {
        return this._props.studentCountRange;
    }
    get status() {
        return this._props.status;
    }
    set status(value) {
        this._props.status = value;
    }
    get onboardingStep() {
        return this._props.onboardingStep;
    }
    get activeBranches() {
        return this._props.activeBranches || [];
    }
    toJSON() {
        return { ...this._props };
    }
}
exports.Organization = Organization;
