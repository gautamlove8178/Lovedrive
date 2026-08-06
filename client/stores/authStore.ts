import { create } from "zustand";

interface AuthStore {
  loggedIn: boolean;

  login: () => void;

  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  loggedIn: false,

  login: () =>
    set({
      loggedIn: true,
    }),

  logout: () =>
    set({
      loggedIn: false,
    }),
}));