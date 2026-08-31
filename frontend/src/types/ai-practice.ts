export enum PracticeDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum PracticeTopic {
  JAVASCRIPT = "JavaScript",
  REACT = "React",
  NODEJS = "Node.js",
  MONGODB = "MongoDB",
  TYPESCRIPT = "TypeScript",
  SQL = "SQL",
  GENERAL_HR = "General HR",
}

export enum PracticeInterviewStatus {
  CREATED = "CREATED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
}

export interface ICreateAIPracticeInterviewRequest {
  difficulty: PracticeDifficulty;
  topics: string[];
  durationMinutes: number;
}

export interface ISubmitPracticeAnswerRequest {
  questionId: string;
  answer: string;
}

export interface IAIPracticeQuestion {
  id: string;
  text: string;
  topic: string;
  candidateAnswer?: string;
  score?: number;
  feedback?: string;
  createdAt: string;
  answeredAt?: string;
}

export interface IPracticeFeedback {
  overallScore: number;
  strengths: string[];
  weakAreas: string[];
  improvementSuggestions: string[];
  topicFeedback: { topic: string; score: number; observations: string }[];
}

export interface IAIPracticeInterviewResponse {
  id: string;
  studentId: string;
  difficulty: PracticeDifficulty;
  topics: string[];
  durationMinutes?: number;
  startedAt?: string;
  status: PracticeInterviewStatus;
  questions: IAIPracticeQuestion[];
  finalFeedback?: IPracticeFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface IPracticeRoomTokenResponse {
  token: string;
  roomName: string;
  liveKitUrl: string;
  sessionId: string;
  status: PracticeInterviewStatus;
}

