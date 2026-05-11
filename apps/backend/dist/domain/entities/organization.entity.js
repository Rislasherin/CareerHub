"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationEntity = void 0;
class OrganizationEntity {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new OrganizationEntity(props);
    }
    getId() {
        if (!this.props.id) {
            throw new Error("Organization id is missing.");
        }
        return this.props.id;
    }
    getName() {
        return this.props.name;
    }
    getShortName() {
        return this.props.shortName;
    }
    getCollegeType() {
        return this.props.collegeType;
    }
    getCity() {
        return this.props.city;
    }
    getState() {
        return this.props.state;
    }
    getWebsite() {
        return this.props.website;
    }
    getPlacementCellName() {
        return this.props.placementCellName;
    }
    getActiveBatch() {
        return this.props.activeBatch;
    }
    getNaacGrade() {
        return this.props.naacGrade;
    }
}
exports.OrganizationEntity = OrganizationEntity;
