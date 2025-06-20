import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  return (
    <header className="bg-card text-card-foreground p-4 shadow-md sticky top-0 z-50 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-headline font-semibold text-primary hover:text-primary/90 transition-colors" aria-label="StorySpark Home">
          <Sparkles className="h-7 w-7 text-primary" />
          StorySpark
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">New Story</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/library">Library</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
