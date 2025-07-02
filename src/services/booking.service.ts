// src/services/booking.service.ts
import api from './api';

export interface BookingData {
  serviceId: string;
  date: string;
  time: string;
  barberId?: string;
}

export interface AppointmentData {
  services: string[];
  date: string;
  time: string;
  employee?: string;
  notes?: string;
}

export interface FullAvailabilityDay {
  date: string;
  isOpen: boolean;
  slots: {
    time: string;
    available: boolean;
  }[];
}

export interface Appointment {
  _id: string;
  user: string | { _id: string; name: string; email: string; phone: string };
  services: string[] | { _id: string; name: string; price: number; duration: number; }[];
  date: string;
  time: string;
  totalDuration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'needsRescheduling';
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt?: string;
  // Añadimos el campo que faltaba
  cancellationReason?: string;
}

export const bookingService = {
  // Obtener citas del usuario actual
  async getAppointments(status?: string, from?: string, to?: string) {
    try {
      let url = '/api/appointments/user';
      const params: Record<string, string> = {};
      
      if (status) params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;
      
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  },

  // Crear una nueva cita
  async createAppointment(data: AppointmentData) {
    try {
      const response = await api.post('/api/appointments', data);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Cancelar una cita
  async cancelAppointment(appointmentId: string, reason?: string) {
    try {
      const response = await api.put(`/api/appointments/${appointmentId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      throw error;
    }
  },

  // Reprogramar una cita
  async rescheduleAppointment(appointmentId: string, data: Partial<AppointmentData>) {
    try {
      const response = await api.put(`/api/appointments/${appointmentId}/reschedule`, data);
      return response.data;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  },

  // Obtener detalles de una cita
  async getAppointmentDetails(appointmentId: string) {
    try {
      const response = await api.get(`/api/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting appointment details:', error);
      throw error;
    }
  },

  // Obtener disponibilidad completa con cache-busting para forzar actualización
  async getFullAvailability(): Promise<FullAvailabilityDay[]> {
    try {
      // Añadimos un timestamp para evitar caché
      const timestamp = new Date().getTime();
      const response = await api.get<FullAvailabilityDay[]>(`/api/availability/full?t=${timestamp}`);
      
      if (!Array.isArray(response.data)) {
        console.error('Error: La respuesta de disponibilidad no es un array', response.data);
        return [];
      }
      
      
      // Log para depuración
      response.data.forEach(day => {
        if (!day.isOpen) {
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  },
  
  // Activar/desactivar recordatorio para una cita
  async toggleAppointmentReminder(appointmentId: string, enabled: boolean) {
    try {
      const response = await api.put(`/api/reminders/appointments/${appointmentId}/toggle`, { enabled });
      return response.data;
    } catch (error) {
      console.error('Error toggling reminder:', error);
      throw error;
    }
  }
};

export default bookingService;