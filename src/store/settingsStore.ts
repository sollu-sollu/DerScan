import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {mmkvStorage} from '../services/storage';

interface SettingsState {
  apiUrl: string;
  isDarkMode: boolean;
  userName: string;
  userAvatar: string | null;
  setApiUrl: (url: string) => void;
  toggleDarkMode: (enabled?: boolean) => void;
  setUserName: (name: string) => void;
  setUserAvatar: (avatar: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      apiUrl: 'http://10.0.2.2:8001', // Default for emulator
      isDarkMode: false,
      userName: 'Guest User',
      userAvatar: null,
      setApiUrl: url => set({apiUrl: url}),
      toggleDarkMode: enabled =>
        set(state => ({isDarkMode: enabled ?? !state.isDarkMode})),
      setUserName: name => set({userName: name}),
      setUserAvatar: avatar => set({userAvatar: avatar}),
    }),
    {
      name: 'derscan-settings',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
