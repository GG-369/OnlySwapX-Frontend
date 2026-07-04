import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  status?: number;
  code: 'NETWORK' | 'TIMEOUT' | 'CLIENT' | 'SERVER' | 'UNKNOWN';

  constructor(message: string, status: number | undefined, code: ApiError['code']) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function toApiError(error: any): ApiError {
  if (axios.isCancel(error)) {
    return new ApiError('Request cancelled', undefined, 'UNKNOWN');
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiError('The request timed out. Please try again.', undefined, 'TIMEOUT');
  }
  if (!error.response) {
    return new ApiError('Network error. Check your connection and try again.', undefined, 'NETWORK');
  }
  const status = error.response.status;
  const serverMessage = error.response.data?.message;
  if (status >= 500) {
    return new ApiError(serverMessage || 'Something went wrong on our end. Please try again later.', status, 'SERVER');
  }
  const clientMessages: Record<number, string> = {
    400: 'Please check the information you submitted.',
    401: 'Your session has expired. Please sign in again.',
    403: "You don't have permission to do that.",
    404: 'The requested resource was not found.',
    409: 'This action conflicts with the current state. Please refresh and try again.',
  };
  return new ApiError(serverMessage || clientMessages[status] || 'Request failed.', status, 'CLIENT');
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${apiClient.defaults.baseURL}/api/v1/auth/refresh`,
            { refreshToken }
          );
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(toApiError(error));
        }
      }
    }

    return Promise.reject(toApiError(error));
  }
);

export default apiClient;
