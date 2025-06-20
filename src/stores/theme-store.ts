
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  hydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light', // Default theme before hydration
      hydrated: false,
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', newTheme);
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'theme-storage', // Name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
      // Only persist the 'theme' property
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

// This ensures setHydrated is called after rehydration
if (typeof window !== 'undefined') {
  useThemeStore.persist.onFinishHydration((state) => {
    if (state) (state as ThemeState).setHydrated(true);
    
    // After hydration, apply the theme from the store/localStorage
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
}
