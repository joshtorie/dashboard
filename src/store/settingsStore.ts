import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoPrintEnabled: boolean;
  toggleAutoPrint: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoPrintEnabled: true, // Default to true
      toggleAutoPrint: () => set((state) => ({ autoPrintEnabled: !state.autoPrintEnabled })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
