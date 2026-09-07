import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';

export interface ReadinessSummary {
  ready: number;
  almostReady: number;
  needsWork: number;
  atRisk: number;
}

export interface StudentReadiness {
  studentId: string;
  name: string;
  department: string;
  readinessScore: number;
  status: 'READY' | 'ALMOST_READY' | 'NEEDS_WORK' | 'AT_RISK';
  mainGap: string;
  reason: string;
  recommendedAction: string;
  factors: {
    resume: number | null;
    interview: number | null;
    skills: number;
    practice: number;
    profile: number;
  };
}

export interface SkillGap {
  skill: string;
  studentsMissing: number;
}

export interface PlacementReadinessResponse {
  summary: ReadinessSummary;
  students: StudentReadiness[];
  skillGaps: SkillGap[];
}

export const getPlacementReadiness = async (): Promise<PlacementReadinessResponse> => {
  const response = await apiClient.get(API_ROUTES.COLLEGE.PLACEMENT_READINESS) as { data: PlacementReadinessResponse };
  return response.data;
};

export const sendPlacementReadinessReminder = async (studentId: string, action: string): Promise<boolean> => {
  const response = await apiClient.post(`${API_ROUTES.COLLEGE.PLACEMENT_READINESS}/${studentId}/remind`, { action }) as { success: boolean };
  return response.success;
};
