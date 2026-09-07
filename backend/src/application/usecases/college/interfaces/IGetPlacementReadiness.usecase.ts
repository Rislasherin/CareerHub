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

export interface IGetPlacementReadinessUseCase {
  execute(collegeId: string): Promise<PlacementReadinessResponse>;
}
