import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {createMMKV} from 'react-native-mmkv';

let storage: any;
try {
  storage = createMMKV();
} catch (e) {
  console.error('MMKV failed to initialize. Native modules might not be linked.', e);
  // Fallback to a mock storage for debugging/startup
  storage = {
    set: () => {},
    getString: () => null,
    delete: () => {},
  };
}

const mmkvStorage = {
  setItem: (name: string, value: string) => {
    try {
      storage.set(name, value);
    } catch (e) {
      console.warn('MMKV setItem failed:', e);
    }
  },
  getItem: (name: string) => {
    try {
      const value = storage.getString(name);
      return value ?? null;
    } catch (e) {
      console.warn('MMKV getItem failed:', e);
      return null;
    }
  },
  removeItem: (name: string) => {
    try {
      storage.delete(name);
    } catch (e) {
      console.warn('MMKV removeItem failed:', e);
    }
  },
};

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
