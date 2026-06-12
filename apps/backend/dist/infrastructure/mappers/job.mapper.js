"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJobPersistence = exports.toJobEntity = void 0;
const Job_1 = require("@domain/entities/Job");
const toJobEntity = (doc) => {
    const rawDoc = doc;
    return Job_1.Job.create({
        id: doc._id.toString(),
        comptypeId: doc.comptypeId,
        collegeId: doc.collegeId,
        title: doc.title,
        category: doc.category,
        openings: doc.openings,
        deadline: doc.deadline,
        type: doc.type,
        eligibility: {
            minCGPA: rawDoc.eligibility?.minCGPA ?? 0,
            allowedBacklogs: rawDoc.eligibility?.allowedBacklogs ?? 0,
            eligibleBranches: rawDoc.eligibility?.eligibleBranches ?? [],
            passingYear: rawDoc.eligibility?.passingYear ?? 0,
            degreeType: rawDoc.eligibility?.degreeType ?? ""
        },
        noticePeriod: doc.noticePeriod,
        experienceLevel: doc.experienceLevel,
        workMode: doc.workMode,
        location: doc.location,
        salaryType: doc.salaryType,
        minSalary: doc.minSalary,
        maxSalary: doc.maxSalary,
        interviewMode: doc.interviewMode,
        description: doc.description,
        requiredSkills: doc.requiredSkills,
        preferredSkills: doc.preferredSkills || [],
        rounds: doc.rounds.map((round) => ({
            roundNumber: round.roundNumber,
            name: round.name,
            type: round.type,
            description: round.description
        })),
        status: doc.status,
        rejectionNote: doc.rejectionNote || undefined,
        approvedColleges: rawDoc.approvedColleges || [],
        rejectedColleges: rawDoc.rejectedColleges || [],
        createdAt: rawDoc.createdAt,
        updatedAt: rawDoc.updatedAt,
        isDeleted: doc.isDeleted || false
    });
};
exports.toJobEntity = toJobEntity;
const toJobPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        comptypeId: props.comptypeId,
        collegeId: props.collegeId,
        title: props.title,
        category: props.category,
        openings: props.openings,
        deadline: props.deadline,
        type: props.type,
        eligibility: {
            minCGPA: props.eligibility.minCGPA,
            allowedBacklogs: props.eligibility.allowedBacklogs,
            eligibleBranches: props.eligibility.eligibleBranches,
            passingYear: props.eligibility.passingYear,
            degreeType: props.eligibility.degreeType
        },
        noticePeriod: props.noticePeriod,
        experienceLevel: props.experienceLevel,
        workMode: props.workMode,
        location: props.location,
        salaryType: props.salaryType,
        minSalary: props.minSalary,
        maxSalary: props.maxSalary,
        interviewMode: props.interviewMode,
        description: props.description,
        requiredSkills: props.requiredSkills,
        preferredSkills: props.preferredSkills || [],
        rounds: props.rounds.map((round) => ({
            roundNumber: round.roundNumber,
            name: round.name,
            type: round.type,
            description: round.description
        })),
        status: props.status,
        rejectionNote: props.rejectionNote,
        approvedColleges: props.approvedColleges,
        rejectedColleges: props.rejectedColleges,
        isDeleted: props.isDeleted || false
    };
};
exports.toJobPersistence = toJobPersistence;
