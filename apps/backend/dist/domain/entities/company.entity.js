"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComptypeEntity = void 0;
class ComptypeEntity {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new ComptypeEntity(props);
    }
    getId() {
        if (!this.props.id) {
            throw new Error("Comptype id is missing.");
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
exports.ComptypeEntity = ComptypeEntity;
