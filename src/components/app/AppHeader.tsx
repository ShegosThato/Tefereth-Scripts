
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function AppHeader() {
  return (
    <header className="bg-card/95 text-card-foreground p-4 shadow-lg sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-2xl font-headline font-bold text-primary hover:text-primary/80 transition-colors duration-200 group"
          aria-label="Tefereth Scripts Home"
        >
          <Sparkles className="h-8 w-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
          <span className="drop-shadow-sm">Tefereth Scripts</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
            <SignedIn>
                <UserButton afterSignOutUrl='/' />
            </SignedIn>
            <SignedOut>
                <Button variant="ghost" asChild className="font-medium hover:text-primary">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="font-medium">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
            </SignedOut>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
