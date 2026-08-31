export enum PracticeAction {
  FOLLOW_UP = 'FOLLOW_UP',
  CLARIFICATION = 'CLARIFICATION',
  NEXT_QUESTION = 'NEXT_QUESTION',
  END_INTERVIEW = 'END_INTERVIEW'
}

export interface IPracticeBrainDecision {
  action: PracticeAction;
  responseText: string;
  nextQuestion?: string;
  topic?: string;
  reason?: string;
}

export interface IPracticeBrainContext {
  difficulty: string;
  selectedTopics: string[];
  interviewDurationMinutes: number;
  timeRemainingMs: number;
  
  currentQuestion: string;
  candidateAnswer: string;
  
  previousQuestions: string[];
  previousAnswers: string[];
  
  currentTopic: string;
  followUpCount: number;
}

export interface IPracticeInterviewBrain {
  processTurn(context: IPracticeBrainContext): Promise<IPracticeBrainDecision>;
}
