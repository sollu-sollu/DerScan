import { create } from 'zustand';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setLoading: (isLoading: boolean) => void;
  reloadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  reloadUser: async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await currentUser.reload();
      const updatedUser = auth().currentUser;
      set({ user: updatedUser, isAuthenticated: !!updatedUser });
    }
  },
}));
