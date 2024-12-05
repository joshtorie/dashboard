import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoPrintEnabled: boolean;
  showHeaderIcon: boolean;
  toggleAutoPrint: () => void;
  toggleHeaderIcon: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoPrintEnabled: true, // Default to true
      showHeaderIcon: true, // Default to true
      toggleAutoPrint: () => set((state) => ({ autoPrintEnabled: !state.autoPrintEnabled })),
      toggleHeaderIcon: () => set((state) => ({ showHeaderIcon: !state.showHeaderIcon })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
