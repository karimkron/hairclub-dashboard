import api from './api';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  points: number;
}

export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(data: Partial<UserProfile>) {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  async getPoints() {
    const response = await api.get('/users/points');
    return response.data;
  },

  async getNotifications() {
    const response = await api.get('/users/notifications');
    return response.data;
  }
};