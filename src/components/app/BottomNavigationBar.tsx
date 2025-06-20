
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilePlus2, LibraryBig, Home } from 'lucide-react'; // Added Home icon
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'New Story', icon: FilePlus2, exact: true },
  { href: '/library', label: 'Library', icon: LibraryBig },
  // Example of adding a Home icon if desired, adjust routes as needed
  // { href: '/dashboard', label: 'Home', icon: Home }, 
];

export function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40 md:hidden"> {/* Hide on md and larger screens */}
      <div className="container mx-auto flex justify-around items-stretch h-16 max-w-md"> {/* items-stretch for full height children */}
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 flex-1 rounded-none transition-all duration-200 ease-in-out", // flex-1 for equal width, rounded-none
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive 
                  ? "text-primary bg-primary/10" // More prominent active state
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-6 w-6 mb-0.5 transition-transform", isActive && "scale-110")} aria-hidden="true" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
