"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const JobStatus_enum_1 = require("@domain/enums/JobStatus.enum");
class Job {
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        return new Job({
            ...props,
            status: props.status || JobStatus_enum_1.JobStatus.PENDING_REVIEW,
            isDeleted: props.isDeleted ?? false
        });
    }
    get id() { return this.props.id; }
    get companyId() { return this.props.companyId; }
    get collegeId() { return this.props.collegeId; }
    get title() { return this.props.title; }
    get category() { return this.props.category; }
    get openings() { return this.props.openings; }
    get deadline() { return this.props.deadline; }
    get type() { return this.props.type; }
    get noticePeriod() { return this.props.noticePeriod; }
    get experienceLevel() { return this.props.experienceLevel; }
    get workMode() { return this.props.workMode; }
    get location() { return this.props.location; }
    get salaryType() { return this.props.salaryType; }
    get minSalary() { return this.props.minSalary; }
    get maxSalary() { return this.props.maxSalary; }
    get interviewMode() { return this.props.interviewMode; }
    get description() { return this.props.description; }
    get requiredSkills() { return this.props.requiredSkills; }
    get preferredSkills() { return this.props.preferredSkills; }
    get rounds() { return this.props.rounds; }
    get status() { return this.props.status; }
    set status(value) { this.props.status = value; }
    get rejectionNote() { return this.props.rejectionNote; }
    set rejectionNote(value) { this.props.rejectionNote = value; }
    get eligibility() { return this.props.eligibility; }
    get approvedColleges() { return this.props.approvedColleges || []; }
    get rejectedColleges() { return this.props.rejectedColleges || []; }
    approveForCollege(collegeId) {
        if (!this.props.approvedColleges)
            this.props.approvedColleges = [];
        if (!this.props.approvedColleges.includes(collegeId)) {
            this.props.approvedColleges.push(collegeId);
        }
        // Remove from rejected if it was there
        if (this.props.rejectedColleges) {
            this.props.rejectedColleges = this.props.rejectedColleges.filter(id => id !== collegeId);
        }
    }
    rejectForCollege(collegeId) {
        if (!this.props.rejectedColleges)
            this.props.rejectedColleges = [];
        if (!this.props.rejectedColleges.includes(collegeId)) {
            this.props.rejectedColleges.push(collegeId);
        }
        // Remove from approved if it was there
        if (this.props.approvedColleges) {
            this.props.approvedColleges = this.props.approvedColleges.filter(id => id !== collegeId);
        }
    }
    get applicantCount() { return this.props.applicantCount; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }
    get isDeleted() { return this.props.isDeleted; }
    delete() {
        this.props.isDeleted = true;
    }
    toJSON() {
        return {
            ...this.props,
            approvedColleges: this.approvedColleges,
            rejectedColleges: this.rejectedColleges
        };
    }
}
exports.Job = Job;
