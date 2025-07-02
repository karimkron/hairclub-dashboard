import { create } from 'zustand';
import { authService } from '../services/auth.service';
import type { RegisterData, User } from '../services/auth.service';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (code: string, newPassword: string) => Promise<any>; 
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        set({ user: response.user, token: response.token, isAuthenticated: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    try {
      authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        set({ user: response.user, token: response.token, isAuthenticated: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Implementación de la función forgotPassword que usa la ruta correcta del backend
  forgotPassword: async (email: string) => {
    try {
      // Hacer la petición directamente a la ruta correcta del backend
      const response = await api.post('/api/auth/forgot-password', { email });
      
      // Guardar el email para usarlo en el reseteo de contraseña
      localStorage.setItem('resetEmail', JSON.stringify(email));
      
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error);
      throw error;
    }
  },

  resetPassword: async (code: string, newPassword: string) => {
    try {
      // Obtenemos el email del usuario desde el localStorage
      const user = JSON.parse(localStorage.getItem('resetEmail') || '""');
      const email = typeof user === 'string' ? user : '';
      
      if (!email) {
        throw new Error('Email no encontrado para resetear contraseña');
      }
      
      // Hacer la petición directamente a la ruta correcta del backend
      const response = await api.post('/api/auth/reset-password', {
        email,
        code,
        password: newPassword
      });
      
      // Limpiamos el email almacenado para el reset
      localStorage.removeItem('resetEmail');
      
      return response.data;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }
}));