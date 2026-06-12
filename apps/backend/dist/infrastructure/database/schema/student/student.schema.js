"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentSchema = void 0;
const mongoose_1 = require("mongoose");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
exports.studentSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false }, // Password optional initially during invite
    status: { type: String, enum: Object.values(user_status_enum_1.UserStatus), default: user_status_enum_1.UserStatus.PENDING_INVITE },
    blockedBy: { type: String, required: false },
    collegeId: { type: String, required: true },
    proofUrl: { type: String, required: false },
    rollNumber: { type: String, required: false },
    department: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    rejectReason: { type: String, required: false },
    invitationToken: { type: String, required: false },
    invitationExpiresAt: { type: Date, required: false },
    isFirstLogin: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    appliedJobs: [{ type: String, default: [] }],
    // Day 12 Student Profile fields
    linkedinUrl: { type: String, required: false },
    githubUrl: { type: String, required: false },
    portfolioUrl: { type: String, required: false },
    city: { type: String, required: false },
    // Academic details (verified & locked)
    degree: { type: String, required: false },
    branch: { type: String, required: false },
    graduationYear: { type: Number, required: false },
    cgpa: { type: Number, required: false },
    tenthPercentage: { type: Number, required: false },
    twelfthPercentage: { type: Number, required: false },
    activeBacklogs: { type: Number, required: false, default: 0 },
    // Skills
    skills: {
        languages: [{ type: String }],
        frameworks: [{ type: String }],
        databases: [{ type: String }],
        cloudDevops: [{ type: String }],
        otherTools: [{ type: String }],
        aiMl: [{ type: String }]
    },
    // Work Experience
    experience: [
        {
            comptype: { type: String, required: true },
            role: { type: String, required: true },
            duration: { type: String, required: true },
            location: { type: String, required: false },
            summary: { type: String, required: false }
        }
    ],
    // Projects
    projects: [
        {
            name: { type: String, required: true },
            techStack: [{ type: String }],
            github: { type: String, required: false },
            liveDemo: { type: String, required: false },
            description: { type: String, required: false }
        }
    ]
}, { timestamps: true });
exports.studentSchema.index({ rollNumber: 1, collegeId: 1 }, { unique: true, sparse: true });
