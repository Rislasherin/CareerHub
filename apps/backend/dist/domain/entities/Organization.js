"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
class Organization {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Organization(props);
    }
    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get city() {
        return this.props.city;
    }
    get state() {
        return this.props.state;
    }
    get studentCountRange() {
        return this.props.studentCountRange;
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
exports.Organization = Organization;
