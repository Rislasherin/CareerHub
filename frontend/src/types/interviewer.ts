export interface Interviewer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  isDeleted?: boolean;
}

export interface GetInterviewersResponse {
  interviewers: Interviewer[];
  total: number;
  page: number;
  limit: number;
}
