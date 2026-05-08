import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, accessToken: null });
      },
    }),
    { name: "auth-store" })
  );

export default useAuthStore;