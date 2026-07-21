import { Schema } from "mongoose";

export const ResumeSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  targetRole: { type: String, required: true },
  versionId: { type: String, default: "v1" },
  resumeName: { type: String, default: "Default Resume" },
  lastSyncedAt: { type: Date, default: Date.now },
  settings: {
    templateId: { type: String, default: "professional" },
    themeColor: { type: String, default: "#1b1430" },
    fontFamily: { type: String, default: "Inter" },
    fontSize: { type: String, default: "base" },
    sectionOrder: [{ type: String }],
    hiddenSections: [{ type: String }]
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    portfolioUrl: { type: String },
    city: { type: String },
  },
  summary: { type: String, default: "" },
  education: [{
    institution: { type: String },
    degree: { type: String },
    graduationYear: { type: Number },
    gpa: { type: String }
  }],
  experience: [{
    company: { type: String },
    role: { type: String },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    bulletPoints: [{ type: String }]
  }],
  projects: [{
    name: { type: String },
    description: { type: String },
    technologies: [{ type: String }],
    link: { type: String }
  }],
  skills: [{ type: String }],
  certifications: [{ type: String }],
  achievements: [{ type: String }],
  languages: [{ type: String }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });
