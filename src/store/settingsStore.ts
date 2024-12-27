import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  autoPrintEnabled: boolean;
  showHeaderIcon: boolean;
  workshopViewEnabled: boolean;
  toggleAutoPrint: () => void;
  toggleHeaderIcon: () => void;
  toggleWorkshopView: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoPrintEnabled: true, // Default to true
      showHeaderIcon: true, // Default to true
      workshopViewEnabled: false, // Default to false
      toggleAutoPrint: () => set((state) => ({ autoPrintEnabled: !state.autoPrintEnabled })),
      toggleHeaderIcon: () => set((state) => ({ showHeaderIcon: !state.showHeaderIcon })),
      toggleWorkshopView: () => set((state) => ({ workshopViewEnabled: !state.workshopViewEnabled })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
