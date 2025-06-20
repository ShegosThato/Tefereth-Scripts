
'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme'; // Updated to use Zustand-powered hook

export function ThemeToggle() {
  const { theme, toggleTheme, hydrated } = useTheme();

  if (!hydrated) {
    // Render a placeholder or null on the server/pre-hydration
    // to avoid hydration mismatch and prevent flash of incorrect icon.
    // The size should match the Button size="icon"
    return <div style={{ width: '2.5rem', height: '2.5rem' }} aria-hidden="true" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
      )}
    </Button>
  );
}
