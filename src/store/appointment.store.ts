import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Service {
  _id: string;
  name: string;
  duration: number;
  price: number;
  category?: string;
  description?: string;
}

interface AppointmentStore {
  selectedServices: Service[];
  selectedDate: Date | null;
  selectedTime: string;
  selectedEmployee: string;
  setDate: (date: Date | string) => void;
  setTime: (time: string) => void;
  setEmployee: (employeeId: string) => void;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  clearAppointment: () => void;
}

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set) => ({
      selectedServices: [],
      selectedDate: null,
      selectedTime: '',
      selectedEmployee: 'any',
      setDate: (date) => {
        // Convert string to Date if needed
        const validDate = date instanceof Date 
          ? date 
          : typeof date === 'string' 
            ? new Date(date) 
            : null;
        set({ selectedDate: validDate });
      },
      setTime: (time) => set({ selectedTime: time }),
      setEmployee: (employeeId) => set({ selectedEmployee: employeeId }),
      addService: (service) => 
        set((state) => ({ 
          selectedServices: [...state.selectedServices.filter(s => s._id !== service._id), service] 
        })),
      removeService: (serviceId) => 
        set((state) => ({
          selectedServices: state.selectedServices.filter(s => s._id !== serviceId)
        })),
      clearAppointment: () => set({
        selectedServices: [],
        selectedDate: null,
        selectedTime: '',
        selectedEmployee: 'any'
      })
    }),
    {
      name: 'appointment-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convertir fechas de string a Date
          if (state.selectedDate && typeof state.selectedDate === 'string') {
            state.selectedDate = new Date(state.selectedDate);
          }
          
          // Validar servicios
          state.selectedServices = state.selectedServices.filter((s: any) => 
            s._id && s.name && s.duration
          );
        }
      }
    }
  )
);