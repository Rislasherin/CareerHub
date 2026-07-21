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
  syncResume: (resumeId: string) => Promise<void>;
  updateSettings: (resumeId: string, newSettings: any) => Promise<void>;  // Actions
  triggerAnalysis: () => Promise<void>;
  triggerAutoFix: (text: string, targetRole: string) => Promise<string | null>;
}

export const useResumeStore = create<ResumeState>()((set) => ({
  report: null,
  isAnalyzing: false,
  isFixing: false,
  isSyncing: false,
  settings: {
    templateId: "professional-ats",
    themeColor: "#1b1430",
    fontFamily: "Inter",
    fontSize: "base"
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

  syncResume: async(resumeId:string) => {
    set({isSyncing:true});
    try {
      await ResumeService.syncProfileToResume(resumeId);
      toast.success("Resume magically synced with your latest Profile!");
    } catch (error:any) {
      toast.error(error?.message || "Failed to sync profile" );
    }finally {
      set({isSyncing: false});
    }
  },
}));
