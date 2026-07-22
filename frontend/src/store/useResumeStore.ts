import { create } from 'zustand';
import { ResumeService } from '../services/api/resume.service';
import { toast } from 'sonner';

export interface AtsReport {
  overallScore: number;
  sectionScores: Record<string, { earned: number; max: number; percentage: number }>;
  criticalIssues: string[];
  warnings: string[];
  improvements: string[];
  strengths: string[];
  aiInsights: string[];
}

interface ResumeState {
  report: AtsReport | null;
  isAnalyzing: boolean;
  isFixing: boolean;
  isSyncing: boolean;
  previewKey: number;
  settings: any;
  syncResume: () => Promise<void>;
  updateSettings: (resumeId: string, newSettings: any) => Promise<void>;  // Actions
  triggerAnalysis: () => Promise<void>;
  triggerAutoFix: (text: string, targetRole: string) => Promise<string | null>;
  triggerRewriteAll: (targetRole: string) => Promise<void>;
  
  // New Version Management
  resumes: any[];
  activeResumeId: string | null;
  isLoadingResumes: boolean;
  fetchResumes: () => Promise<void>;
  createNewResume: (title: string) => Promise<void>;
  setActiveResume: (id: string) => void;

  // JD Match
  jobMatchReport: any | null;
  isMatchingJob: boolean;
  triggerJobMatch: (jobDescription: string) => Promise<void>;

  // AI Section Coach
  sectionCoachResult: any | null;
  isCoachingSection: boolean;
  triggerSectionCoach: (sectionName: string, instructions: string, targetRole: string) => Promise<void>;
  clearSectionCoach: () => void;

  // AI Rewrite Side-by-Side Comparison
  rewriteComparison: { original: any; suggested: any } | null;
  clearRewriteComparison: () => void;
  acceptRewriteComparison: (suggestedData: any) => Promise<void>;
}


export const useResumeStore = create<ResumeState>()((set) => ({
  report: null,
  isAnalyzing: false,
  isFixing: false,
  isSyncing: false,
  previewKey: Date.now(),
  settings: {
    templateId: "professional",
    themeColor: "#1b1430",
    fontFamily: "Inter",
    fontSize: "base"
  },
  resumes: [],
  activeResumeId: null,
  isLoadingResumes: false,

  jobMatchReport: null,
  isMatchingJob: false,

  sectionCoachResult: null,
  isCoachingSection: false,

  fetchResumes: async () => {
    set({ isLoadingResumes: true });
    try {
      const resumes = await ResumeService.fetchAllResumes();
      const activeId = resumes.length > 0 ? resumes[0]._id || resumes[0].id : null;
      const activeSettings = resumes.length > 0 ? resumes[0].settings : { templateId: "professional" };
      set({ 
        resumes, 
        activeResumeId: activeId,
        settings: activeSettings,
        isLoadingResumes: false 
      });
    } catch (error) {
      set({ isLoadingResumes: false });
      toast.error("Failed to load resumes");
    }
  },

  createNewResume: async (title: string) => {
    try {
      const newResume = await ResumeService.createResume(title);
      set((state) => ({
        resumes: [newResume, ...state.resumes],
        activeResumeId: newResume._id || newResume.id,
        settings: newResume.settings || { templateId: "professional" }
      }));
      toast.success("New resume version created!");
    } catch (error) {
      toast.error("Failed to create resume");
    }
  },

  setActiveResume: (id: string) => {
    set((state) => {
      const active = state.resumes.find(r => (r._id || r.id) === id);
      return { 
        activeResumeId: id, 
        jobMatchReport: null,
        report: null,           // clear stale ATS score from previous version
        sectionCoachResult: null,
        settings: active?.settings || { templateId: "professional" }
      };
    });
  },

  triggerJobMatch: async (jobDescription: string) => {
    const { activeResumeId } = useResumeStore.getState();
    if (!activeResumeId) {
        toast.error("No active resume selected");
        return;
    }
    
    set({ isMatchingJob: true });
    try {
      const report = await ResumeService.matchJobDescription(activeResumeId, jobDescription);
      set({ jobMatchReport: report, isMatchingJob: false });
      toast.success("Job match analysis complete!");
    } catch (error) {
      set({ isMatchingJob: false });
      toast.error("Failed to match job description.");
    }
  },

  triggerSectionCoach: async (sectionName: string, instructions: string, targetRole: string) => {
    const { activeResumeId } = useResumeStore.getState();
    if (!activeResumeId) {
        toast.error("No active resume selected");
        return;
    }
    
    set({ isCoachingSection: true, sectionCoachResult: null });
    try {
      const result = await ResumeService.coachSection(activeResumeId, sectionName, instructions, targetRole);
      set({ sectionCoachResult: result, isCoachingSection: false });
      toast.success(`${sectionName} coached successfully!`);
    } catch (error) {
      set({ isCoachingSection: false });
      toast.error(`Failed to coach ${sectionName}.`);
    }
  },

  clearSectionCoach: () => {
    set({ sectionCoachResult: null });
  },

  updateSettings: async (resumeId: string, newSettings: any) => {
    // OPTIMISTIC UI
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
    
    // AUTO-SAVE
    try {
      await ResumeService.updateSettings(resumeId, newSettings);
    } catch (error: any) {
      toast.error("Auto-save failed. Check your connection.");
    }
  },

  triggerAnalysis: async () => {
    const { activeResumeId } = useResumeStore.getState();
    if (!activeResumeId) {
      toast.error("Please select a resume version first.");
      return;
    }
    set({ isAnalyzing: true });
    try {
      const reportData = await ResumeService.analyzeResume(activeResumeId);
      set({
        report: reportData as AtsReport,
        isAnalyzing: false
      });
      toast.success("Resume analyzed successfully!");
    } catch (error: unknown) {
      set({ isAnalyzing: false });
      const err = error as { message?: string };
      if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred during analysis.");
      }
    }
  },

  triggerAutoFix: async (text: string, targetRole: string) => {
    set({ isFixing: true });
    try {
      const data = await ResumeService.autoFixText(text, targetRole);
      set({ isFixing: false });
      toast.success("AI optimization complete!");
      return data.fixedText;
    } catch (error: any) {
      set({ isFixing: false });
      if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Could not optimize text. Please try again.");
      }
      return null;
    }
  },

  // AI Rewrite Side-by-Side Comparison
  rewriteComparison: null,
  clearRewriteComparison: () => set({ rewriteComparison: null }),
  acceptRewriteComparison: async (suggestedData: any) => {
    const { activeResumeId, updateSettings, triggerAnalysis } = useResumeStore.getState();
    if (!activeResumeId) return;
    try {
      set({ isAnalyzing: true });
      await updateSettings(activeResumeId, {
        summary: suggestedData.summary,
        experience: suggestedData.experience,
        projects: suggestedData.projects
      });
      set({ rewriteComparison: null, previewKey: Date.now() });
      toast.success("Optimizations saved to your resume successfully!");
      await triggerAnalysis();
    } catch (error: any) {
      set({ isAnalyzing: false });
      toast.error("Failed to save changes. Please try again.");
    }
  },

  triggerRewriteAll: async (targetRole: string) => {
    const { activeResumeId } = useResumeStore.getState();
    if (!activeResumeId) {
      toast.error("Please select a resume version first.");
      return;
    }
    set({ isAnalyzing: true, rewriteComparison: null });
    try {
      const data = await ResumeService.rewriteEntireResume(activeResumeId, targetRole);
      set({ rewriteComparison: data as { original: unknown; suggested: unknown }, isAnalyzing: false });
      toast.success("AI Resume Optimization suggestions are ready for review!");
    } catch (error: unknown) {
      set({ isAnalyzing: false });
      const err = error as { message?: string };
      toast.error(err?.message || "Failed to generate AI rewrite suggestions.");
    }
  },

  syncResume: async() => {
    set({ isSyncing: true });
    try {
      const { activeResumeId } = useResumeStore.getState();
      if (!activeResumeId) {
          toast.error("Please select a resume version first.");
          return;
      }
      await ResumeService.syncProfileToResume(activeResumeId);
      toast.success("Your resume has been updated with your latest profile details!");
      set({ previewKey: Date.now() });
    } catch (error: any) {
      toast.error(error?.message || "Failed to update resume from profile");
    } finally {
      set({ isSyncing: false });
    }

  },
}));



