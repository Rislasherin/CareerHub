import { Schema } from "mongoose";

export const JobSchema = new Schema(
  {
    companyId: { type: String, required: true, index: true },
    collegeId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    openings: { type: Number, required: true },
    deadline: { type: Date, required: true },
    type: { type: String, required: true },
    noticePeriod: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    workMode: { type: String, enum: ["on-site", "remote", "hybrid"], required: true },
    location: { type: String, required: true },
    salaryType: { type: String, enum: ["per_month", "per_year"], required: true },
    minSalary: { type: Number, required: true },
    maxSalary: { type: Number, required: true },
    interviewMode: { type: String, enum: ["online", "offline", "hybrid"], required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String, required: true }],
    preferredSkills: [{ type: String }],
    rounds: [
      {
        roundNumber: { type: Number, required: true },
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ["aptitude", "coding", "technical", "hr", "group_discussion"],
          required: true
        },
        description: { type: String }
      }
    ],
    eligibility: {
      minCGPA: { type: Number, default: 0 },
      allowedBacklogs: { type: Number, default: 0 },
      eligibleBranches: [{ type: String }],
      passingYear: { type: Number, default: 0 },
      degreeType: { type: String, default: "" }
    },
    approvedColleges: [{ type: String, default: [] }],
    rejectedColleges: [{ type: String, default: [] }],
    status: { type: String, required: true, index: true },
    rejectionNote: { type: String },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);
