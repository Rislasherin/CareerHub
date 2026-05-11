import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for sending/receiving cookies (like refresh tokens)
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data; // Just return the data part
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle Network Errors or Server Down
    if (!error.response) {
      toast.error('Network Error: Unable to reach the server.');
      return Promise.reject(error);
    }

    const statusCode = error.response.status;
    const errorMessage = (error.response.data as any)?.message || error.message || 'Something went wrong';

    // Handle 401 Unauthorized (Token Expiration)
    if (statusCode === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        
        isRefreshing = false;
        processQueue(null);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err as Error);
        toast.error('Session expired. Please log in again.');
        // Optionally redirect to login here, or let the AuthContext handle it
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }

    // Show toast for other errors automatically, except specific expected ones if needed
    if (statusCode >= 400 && statusCode !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error.response.data || error);
  }
);
