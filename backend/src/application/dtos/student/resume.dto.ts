import { z } from 'zod';

export const SyncProfileSchema = z.object({
  resumeId: z.string().optional()
});

export const UpdateSettingsSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required"),
  settings: z.object({
    templateId: z.string().optional(),
    themeColor: z.string().optional(),
    fontFamily: z.string().optional(),
    fontSize: z.string().optional(),
    sectionOrder: z.array(z.string()).optional(),
    hiddenSections: z.array(z.string()).optional()
  }).optional(),
  summary: z.string().optional(),
  targetRole: z.string().optional(),
  experience: z.array(z.any()).optional(),
  projects: z.array(z.any()).optional(),
  skills: z.array(z.string()).optional()
});


export const AutoFixSchema = z.object({
  text: z.string().min(1, "Text is required"),
  targetRole: z.string().min(1, "Target role is required")
});

export const RewriteAllSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required"),
  targetRole: z.string().default("Software Engineer")
});

export const CreateResumeSchema = z.object({
  title: z.string().min(1, "Resume title is required")
});

export const AnalyzeSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required")
});

export const MatchJobSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required"),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters")
});

export const CoachSectionSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required"),
  sectionName: z.string().min(1, "sectionName is required"),
  instructions: z.string().min(1, "instructions are required"),
  targetRole: z.string().min(1, "targetRole is required")
});
