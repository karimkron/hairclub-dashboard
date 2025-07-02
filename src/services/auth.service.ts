import api from './api';


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  phone: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MessageResponse {
  message: string;
}

export const verifyCode = async (code: string, email: string) => {
  try {
    const response = await api.post('/api/verification/verify-code', { code, email });
    return response.data;
  } catch (error) {
    console.error('Error al verificar el código:', error);
    throw new Error('Error al verificar el código');
  }
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);
    return data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register-user', data);
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/api/auth/request-reset', { email });
    return response.data;
  },

  async verifyResetCode(email: string, code: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/api/auth/verify-code', { email, code });
    return response.data;
  },

  async resetPassword(email: string, code: string, password: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/api/auth/reset-password', { email, code, password });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};