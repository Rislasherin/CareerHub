import { Schema } from "mongoose";

export const JobSchema = new Schema(
  {
    companyId: { type: String, required: true, index: true },
    collegeId: { type: String, required: function(this: any) { return this.status !== 'draft'; }, index: true, default: "ALL" },
    title: { type: String, required: true },
    category: { type: String, required: function(this: any) { return this.status !== 'draft'; } },
    openings: { type: Number, required: function(this: any) { return this.status !== 'draft'; } },
    deadline: { type: Date, required: function(this: any) { return this.status !== 'draft'; } },
    type: { type: String, required: function(this: any) { return this.status !== 'draft'; } },
    noticePeriod: { type: String, required: function(this: any) { return this.status !== 'draft'; } },
    experienceLevel: { type: String, required: function(this: any) { return this.status !== 'draft'; } },
    workMode: { type: String, enum: ["on-site", "remote", "hybrid"], required: function(this: any) { return this.status !== 'draft'; } },
    location: { type: String, required: function(this: any) { return this.status !== 'draft' && this.workMode !== 'remote'; } },
    salaryType: { type: String, enum: ["per_month", "per_year"], required: function(this: any) { return this.status !== 'draft'; } },
    minSalary: { type: Number, required: function(this: any) { return this.status !== 'draft'; } },
    maxSalary: { type: Number, required: function(this: any) { return this.status !== 'draft'; } },
    interviewMode: { type: String, enum: ["online", "offline", "hybrid"], required: function(this: any) { return this.status !== 'draft'; } },
    description: { type: String, required: function(this: any) { return this.status !== 'draft'; } },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    rounds: [
      {
        roundNumber: { type: Number, required: true },
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ["APTITUDE", "CODING", "TECHNICAL", "HR", "GROUP_DISCUSSION"],
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
    scheduledPublishAt: { type: Date, index: true },
    scheduledTimezone: { type: String },
    publishOption: { type: String, enum: ["publish_now", "draft", "schedule"], default: "publish_now" },
    rejectionNote: { type: String },
    closureReason: { type: String },
    closedAt: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);
