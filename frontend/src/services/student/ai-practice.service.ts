import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import {
  ICreateAIPracticeInterviewRequest,
  ISubmitPracticeAnswerRequest,
  IAIPracticeInterviewResponse,
  IPracticeRoomTokenResponse,
} from '@/types/ai-practice';

// The apiClient interceptor already unwraps response.data (the JSON body),
// so apiClient.post<T> resolves to T directly — we do NOT call .data again.
type APracticeResponse = { success: boolean; data: IAIPracticeInterviewResponse; message: string };
type ARoomTokenResponse = { success: boolean; data: IPracticeRoomTokenResponse; message: string };

export interface IStudentAIPracticeService {
  createPractice(data: ICreateAIPracticeInterviewRequest): Promise<APracticeResponse>;
  getPractice(id: string): Promise<APracticeResponse>;
  getLatestCompletedPractice(): Promise<APracticeResponse>;
  startSession(id: string): Promise<APracticeResponse>;
  getRoomToken(id: string): Promise<ARoomTokenResponse>;
  submitAnswer(id: string, data: ISubmitPracticeAnswerRequest): Promise<APracticeResponse>;
}

class StudentAIPracticeServiceImpl implements IStudentAIPracticeService {
  async createPractice(data: ICreateAIPracticeInterviewRequest): Promise<APracticeResponse> {
    return apiClient.post<APracticeResponse>(API_ROUTES.STUDENT.AI_PRACTICE, data) as unknown as APracticeResponse;
  }

  async getPractice(id: string): Promise<APracticeResponse> {
    return apiClient.get<APracticeResponse>(`${API_ROUTES.STUDENT.AI_PRACTICE}/${id}`) as unknown as APracticeResponse;
  }

  async getLatestCompletedPractice(): Promise<APracticeResponse> {
    return apiClient.get<APracticeResponse>(`${API_ROUTES.STUDENT.AI_PRACTICE}/user/latest-completed`) as unknown as APracticeResponse;
  }

  async startSession(id: string): Promise<APracticeResponse> {
    return apiClient.post<APracticeResponse>(`${API_ROUTES.STUDENT.AI_PRACTICE}/${id}/start`) as unknown as APracticeResponse;
  }

  async getRoomToken(id: string): Promise<ARoomTokenResponse> {
    return apiClient.get<ARoomTokenResponse>(`${API_ROUTES.STUDENT.AI_PRACTICE}/${id}/room-token`) as unknown as ARoomTokenResponse;
  }

  async submitAnswer(id: string, data: ISubmitPracticeAnswerRequest): Promise<APracticeResponse> {
    return apiClient.post<APracticeResponse>(
      `${API_ROUTES.STUDENT.AI_PRACTICE}/${id}/answer`,
      data
    ) as unknown as APracticeResponse;
  }
}

export const StudentAIPracticeService: IStudentAIPracticeService = new StudentAIPracticeServiceImpl();
