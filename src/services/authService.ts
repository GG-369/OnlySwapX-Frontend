import apiClient from './apiClient';
import type { SignUpRequest, SignInRequest, TokenResponse, RefreshTokenRequest, VerifyEmailRequest } from '@/types';

export const authService = {
  signUp: (data: SignUpRequest) =>
    apiClient.post<TokenResponse>('/api/v1/auth/sign-up', data).then((r) => r.data),

  signIn: (data: SignInRequest) =>
    apiClient.post<TokenResponse>('/api/v1/auth/sign-in', data).then((r) => r.data),

  refresh: (data: RefreshTokenRequest) =>
    apiClient.post<TokenResponse>('/api/v1/auth/refresh', data).then((r) => r.data),

  verifyEmail: (data: VerifyEmailRequest) =>
    apiClient.post<void>('/api/v1/auth/verify-email', data).then((r) => r.data),

  resendCode: (email: string) =>
    apiClient.post<void>(`/api/v1/auth/resend-code?email=${encodeURIComponent(email)}`).then((r) => r.data),
};
