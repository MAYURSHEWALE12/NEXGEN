import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://dummyjson.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Auth Token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized Error Handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    let customErrorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // The request was made and the server responded with a status code
      const status = error.response.status;
      const apiMessage = error.response.data?.message;

      if (status === 401) {
        customErrorMessage = apiMessage || 'Invalid credentials or session expired.';
      } else if (status === 403) {
        customErrorMessage = 'Access denied. You do not have permission.';
      } else if (status === 404) {
        customErrorMessage = apiMessage || 'The requested resource was not found.';
      } else if (status >= 500) {
        customErrorMessage = 'Server error. Please try again later.';
      } else if (apiMessage) {
        customErrorMessage = apiMessage;
      }
    } else if (error.request) {
      // The request was made but no response was received (network error / timeout)
      if (error.code === 'ECONNABORTED') {
        customErrorMessage = 'Request timed out. Please check your connection.';
      } else {
        customErrorMessage = 'Network error. Please check your internet connection.';
      }
    }

    // Attach user-friendly formatted message
    const formattedError = new Error(customErrorMessage);
    (formattedError as any).status = error.response?.status;
    (formattedError as any).originalError = error;

    return Promise.reject(formattedError);
  }
);

export default apiClient;
