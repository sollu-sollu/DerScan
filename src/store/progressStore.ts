import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../services/storage';

/**
 * Progress Store
 * Manages the active healing journey (seriesId) across the application.
 */
interface ProgressState {
  activeSeriesId: string | null;
  setActiveSeriesId: (id: string | null) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      activeSeriesId: null,
      setActiveSeriesId: (id) => set({ activeSeriesId: id }),
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
