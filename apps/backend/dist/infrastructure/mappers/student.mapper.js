"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStudentPersistence = exports.toStudentEntity = void 0;
const student_1 = require("@domain/entities/student");
const toStudentEntity = (doc) => {
    const rawDoc = doc;
    return student_1.Student.create({
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        password: doc.password || '',
        status: doc.status,
        collegeId: doc.collegeId,
        proofUrl: doc.proofUrl || undefined,
        isFirstLogin: doc.isFirstLogin,
        rollNumber: doc.rollNumber || undefined,
        department: doc.department || undefined,
        phoneNumber: doc.phoneNumber || undefined,
        invitationToken: doc.invitationToken || undefined,
        invitationExpiresAt: doc.invitationExpiresAt || undefined,
        rejectReason: doc.rejectReason || undefined,
        createdAt: doc.createdAt || undefined,
        updatedAt: doc.updatedAt || undefined,
        // Day 12 Profile fields
        linkedinUrl: rawDoc.linkedinUrl || undefined,
        githubUrl: rawDoc.githubUrl || undefined,
        portfolioUrl: rawDoc.portfolioUrl || undefined,
        city: rawDoc.city || undefined,
        degree: rawDoc.degree || undefined,
        branch: rawDoc.branch || undefined,
        graduationYear: rawDoc.graduationYear || undefined,
        cgpa: rawDoc.cgpa || undefined,
        tenthPercentage: rawDoc.tenthPercentage || undefined,
        twelfthPercentage: rawDoc.twelfthPercentage || undefined,
        activeBacklogs: rawDoc.activeBacklogs || 0,
        skills: rawDoc.skills ? {
            languages: rawDoc.skills.languages || [],
            frameworks: rawDoc.skills.frameworks || [],
            databases: rawDoc.skills.databases || [],
            cloudDevops: rawDoc.skills.cloudDevops || [],
            otherTools: rawDoc.skills.otherTools || [],
            aiMl: rawDoc.skills.aiMl || []
        } : undefined,
        experience: rawDoc.experience ? rawDoc.experience.map((exp) => ({
            comptype: exp.comptype,
            role: exp.role,
            duration: exp.duration,
            location: exp.location,
            summary: exp.summary
        })) : [],
        projects: rawDoc.projects ? rawDoc.projects.map((proj) => ({
            name: proj.name,
            techStack: proj.techStack || [],
            github: proj.github,
            liveDemo: proj.liveDemo,
            description: proj.description
        })) : [],
        appliedJobs: rawDoc.appliedJobs || []
    });
};
exports.toStudentEntity = toStudentEntity;
const toStudentPersistence = (entity) => {
    const props = entity.toJSON();
    return {
        firstName: props.firstName,
        lastName: props.lastName,
        email: props.email,
        password: props.password,
        status: props.status,
        collegeId: props.collegeId,
        proofUrl: props.proofUrl,
        isFirstLogin: props.isFirstLogin,
        rollNumber: props.rollNumber,
        department: props.department,
        phoneNumber: props.phoneNumber,
        invitationToken: props.invitationToken,
        invitationExpiresAt: props.invitationExpiresAt,
        rejectReason: props.rejectReason,
        // Day 12 profile
        linkedinUrl: props.linkedinUrl,
        githubUrl: props.githubUrl,
        portfolioUrl: props.portfolioUrl,
        city: props.city,
        degree: props.degree,
        branch: props.branch,
        graduationYear: props.graduationYear,
        cgpa: props.cgpa,
        tenthPercentage: props.tenthPercentage,
        twelfthPercentage: props.twelfthPercentage,
        activeBacklogs: props.activeBacklogs,
        skills: props.skills,
        experience: props.experience,
        projects: props.projects,
        appliedJobs: props.appliedJobs
    };
};
exports.toStudentPersistence = toStudentPersistence;
