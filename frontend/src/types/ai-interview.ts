// frontend/src/types/ai-interview.types.ts

export type InterviewUIState = 
  | 'connecting' 
  | 'preparing' 
  | 'ai_joining' 
  | 'ai_ready' 
  | 'in_progress' 
  | 'completed' 
  | 'error';

export type AIConversationState = 
  | 'AI_SPEAKING' 
  | 'LISTENING' 
  | 'PROCESSING' 
  | 'READY';

export type TranscriptSpeaker = 'AI' | 'STUDENT';

export interface ITranscriptMessage {
  id: string;
  speaker: TranscriptSpeaker;
  text: string;
  timestamp: string;
}

export interface IFinalInterviewResult {
  sessionId: string;
  interviewId: string;
  studentId: string;
  overallScore: number;
  categoryScores: Record<string, number>;
  evaluatedQuestionCount: number;
  totalQuestions: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NEEDS_REVIEW' | 'NO_HIRE';
  completedAt?: string;
}

export interface ISessionStatusDTO {
  sessionId: string;
  phase: string;
  startedAt: string | null;
  durationMinutes: number;
  isCompleted: boolean;
  currentQuestion?: string;
  transcript?: Array<{
    id: string;
    text: string;
    candidateAnswer?: string;
  }>;
}

export interface ISessionTokenDTO {
  token: string;
  durationMinutes: number;
  startedAt: string | null;
  phase: string;
}

export interface IDeviceCheckStatus {
  hasCamera: boolean;
  hasMicrophone: boolean;
  cameraPermission: 'prompt' | 'granted' | 'denied';
  microphonePermission: 'prompt' | 'granted' | 'denied';
  stream: MediaStream | null;
  error: string | null;
}
