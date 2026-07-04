import apiClient from './apiClient';
import type { UserDetailResponse, UserSummaryResponse, CreateAdminRequest, CreateUserRequest } from '@/types';

export const userService = {
  getMe: () =>
    apiClient.get<UserDetailResponse>('/api/v1/users/me').then((r) => r.data),

  getUserById: (id: number) =>
    apiClient.get<UserDetailResponse>(`/api/v1/users/${id}`).then((r) => r.data),

  getAllUsers: () =>
    apiClient.get<UserSummaryResponse[]>('/api/v1/users').then((r) => r.data),

  updateRole: (id: number, role: string) =>
    apiClient.put<void>(`/api/v1/users/${id}/role`, { role }).then((r) => r.data),

  createAdmin: (data: CreateAdminRequest) =>
    apiClient.post<UserDetailResponse>('/api/v1/users/admins', data).then((r) => r.data),

  createUser: (data: CreateUserRequest) =>
    apiClient.post<UserDetailResponse>('/api/v1/users', data).then((r) => r.data),

  deleteUser: (id: number) =>
    apiClient.delete<void>(`/api/v1/users/${id}`).then((r) => r.data),

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<UserDetailResponse>('/api/v1/users/me/photo', formData, {
        headers: { 'Content-Type': undefined as unknown as string },
      })
      .then((r) => r.data);
  },
};
