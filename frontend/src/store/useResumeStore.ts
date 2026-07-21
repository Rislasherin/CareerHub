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
}

export const useResumeStore = create<ResumeState>()((set) => ({
  report: null,
  isAnalyzing: false,
  isFixing: false,
  isSyncing: false,
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
    set({ isAnalyzing: true });
    try {
      const reportData = await ResumeService.analyzeResume();
      set({
        report: reportData,
        isAnalyzing: false
      });
      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      set({ isAnalyzing: false });
      if (error?.message) {
        toast.error(error.message);
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
      toast.success("Text fixed magically!");
      return data.fixedText;
    } catch (error: any) {
      set({ isFixing: false });
      if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred during auto-fix.");
      }
      return null;
    }
  },

  triggerRewriteAll: async (targetRole: string) => {
    set({ isAnalyzing: true }); // Using isAnalyzing to show loader on the main button
    try {
      await ResumeService.rewriteEntireResume(targetRole);
      toast.success("Resume fully optimized by AI!");
      // Re-run analysis to get new score
      const reportData = await ResumeService.analyzeResume();
      set({ report: reportData, isAnalyzing: false });
    } catch (error: any) {
      set({ isAnalyzing: false });
      toast.error(error?.message || "Failed to rewrite resume.");
    }
  },

  syncResume: async() => {
    set({isSyncing:true});
    try {
      const { activeResumeId } = useResumeStore.getState();
      if (!activeResumeId) {
          toast.error("No active resume selected");
          return;
      }
      await ResumeService.syncProfileToResume(activeResumeId);
      toast.success("Resume magically synced with your latest Profile!");
      
      // Update iframe source slightly to force refresh if preview is open
      const iframe = document.querySelector('iframe[title="Live Resume Preview"]') as HTMLIFrameElement;
      if (iframe) {
         const currentSrc = iframe.src;
         const url = new URL(currentSrc);
         url.searchParams.set('t', Date.now().toString());
         iframe.src = url.toString();
      }
      
    } catch (error:any) {
      toast.error(error?.message || "Failed to sync profile" );
    }finally {
      set({isSyncing: false});
    }
  },
}));
