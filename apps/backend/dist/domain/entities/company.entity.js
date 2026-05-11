"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyEntity = void 0;
class CompanyEntity {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new CompanyEntity(props);
    }
    getId() {
        if (!this.props.id) {
            throw new Error("Company id is missing.");
        }
        return this.props.id;
    }
    getName() {
        return this.props.name;
    }
    getSize() {
        return this.props.size;
    }
    getIndustry() {
        return this.props.industry;
    }
    getPrimaryContactName() {
        return this.props.primaryContactName;
    }
    getPrimaryContactEmail() {
        return this.props.primaryContactEmail;
    }
    getPrimaryContactPhone() {
        return this.props.primaryContactPhone;
    }
}
exports.CompanyEntity = CompanyEntity;
