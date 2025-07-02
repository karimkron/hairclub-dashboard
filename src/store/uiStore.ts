import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true, // Estado inicial de la barra lateral

  toggleSidebar: () => {
    try {
      set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
    } catch (error) {
      console.error('Error toggling sidebar:', error);
    }
  },
}));