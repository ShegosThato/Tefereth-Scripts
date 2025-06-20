
'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme'; 

export function ThemeToggle() {
  const { theme, toggleTheme, hydrated } = useTheme();

  if (!hydrated) {
    return <div style={{ width: '2.5rem', height: '2.5rem' }} aria-hidden="true" className="rounded-md bg-muted/50 animate-pulse" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      className="hover:bg-accent/80 hover:text-accent-foreground transition-all duration-200 ease-in-out transform hover:scale-110"
    >
      {theme === 'light' ? (
        <Moon className="h-[1.3rem] w-[1.3rem] transition-all duration-300 ease-out transform group-hover:fill-current" aria-hidden="true" />
      ) : (
        <Sun className="h-[1.3rem] w-[1.3rem] transition-all duration-300 ease-out transform group-hover:fill-current" aria-hidden="true" />
      )}
    </Button>
  );
}
