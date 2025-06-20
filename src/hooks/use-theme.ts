
'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';

export function useTheme() {
  const { theme, setTheme, toggleTheme, hydrated } = useThemeStore();

  useEffect(() => {
    // This effect runs only on the client after Zustand store is hydrated
    if (hydrated) {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
      
      if (theme !== initialTheme) { // Sync if store differs from initial calculated/localStorage theme
        setTheme(initialTheme);
      }

      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [hydrated, theme, setTheme]);


  // Expose theme and toggleTheme, set is handled internally by store
  return { theme: hydrated ? theme : 'light', toggleTheme, hydrated };
}
