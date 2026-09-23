import apiClient from './apiClient';
import { User } from '@/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse extends User {
  accessToken?: string;
  token?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password,
      expiresInMins: 120,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
