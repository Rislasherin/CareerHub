import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ErrorResponseData {
  error?: {
    message?: string;
  };
  message?: string;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Handle Network Errors or Server Down
    if (!error.response) {
      toast.error('Network Error: Unable to reach the server.');
      return Promise.reject(error);
    }

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const statusCode = error.response.status;
    const errorData = error.response.data as ErrorResponseData | undefined;
    const errorMessage = errorData?.error?.message || errorData?.message || error.message || 'Something went wrong';

    const isAuthRoute = originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register');

    // Shared logout function
    const performGlobalLogout = async (errorType?: string) => {
      if (typeof window !== 'undefined') {
        const { store } = await import('@/redux/store');
        const { clearAuth } = await import('@/redux/slices/authSlice');
        const { clearStudentDetails } = await import('@/redux/slices/studentSlice');
        const { clearCollegeAdminDetails } = await import('@/redux/slices/collegeAdminSlice');
        const { clearHRDetails } = await import('@/redux/slices/hrSlice');
        const { clearInterviewerDetails } = await import('@/redux/slices/interviewerSlice');
        const { clearSuperAdminDetails } = await import('@/redux/slices/superAdminSlice');

        store.dispatch(clearAuth());
        store.dispatch(clearStudentDetails());
        store.dispatch(clearCollegeAdminDetails());
        store.dispatch(clearHRDetails());
        store.dispatch(clearInterviewerDetails());
        store.dispatch(clearSuperAdminDetails());

        const loginUrl = errorType ? `/login?error=${errorType}` : '/login';
        window.location.href = loginUrl;
      }
    };

    // Immediate logout if blocked
    if (errorMessage.toLowerCase().includes('blocked')) {
      toast.error(errorMessage || 'Your session has ended.');
      await performGlobalLogout('blocked');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Token Expiration)
    if (statusCode === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token' && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
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
        processQueue(err instanceof Error ? err : new Error('Token refresh failed'));

        await performGlobalLogout('session_expired');
        return Promise.reject(err);
      }
    }

    // Show toast for other errors automatically, except specific expected ones if needed
    if (statusCode >= 400 && (statusCode !== 401 || isAuthRoute)) {
      toast.error(errorMessage);
    }

    return Promise.reject(error.response.data || error);
  }
);