import client from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    client.post('/auth/login', { email, password }).then((r) => r.data),

  logout: (): Promise<void> =>
    client.post('/auth/logout').then(() => undefined),

  refresh: (refreshToken: string): Promise<{ access_token: string }> =>
    client.post('/auth/refresh', { refresh_token: refreshToken }).then((r) => r.data),

  getMe: (): Promise<User> =>
    client.get('/users/me').then((r) => r.data),
};
