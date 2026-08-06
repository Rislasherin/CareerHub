export interface JoinInterviewResult {
  liveKitToken: string;
  liveKitUrl:   string;
  roomName:     string;
}

export interface JoinInterviewInput {
  interviewId: string;
  studentId:   string;
}

export interface IJoinInterviewUseCase {
  execute(input: JoinInterviewInput): Promise<JoinInterviewResult>;
}