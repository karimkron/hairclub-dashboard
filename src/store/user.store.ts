// src/store/user.store.ts
import { create } from 'zustand';
import api from '../services/api';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  points: number;
  rank: string;
  isVerified: boolean;
  createdAt: string;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  loading: false,
  error: null,
  
  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<UserProfile>('/api/users/me');
      set({ profile: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ 
        error: 'No se pudo cargar el perfil. Por favor, intenta de nuevo más tarde.', 
        loading: false 
      });
    }
  },
  
  updateProfile: async (data) => {
    try {
      set({ loading: true, error: null });
      // Usar nueva ruta
      const response = await api.put<UserProfile>('/api/users/me', data);
      set({ profile: response.data, loading: false });
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      set({ 
        error: error.response?.data?.message || 'Error al actualizar el perfil', 
        loading: false 
      });
      return Promise.reject(error);
    }
  },
  
  updatePassword: async (currentPassword, newPassword) => {
    try {
      set({ loading: true, error: null });
      // Usar nueva ruta
      await api.put('/api/users/me/password', { 
        currentPassword, 
        newPassword 
      });
      set({ loading: false });
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error updating password:', error);
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la contraseña', 
        loading: false 
      });
      return Promise.reject(error);
    }
  }
}));