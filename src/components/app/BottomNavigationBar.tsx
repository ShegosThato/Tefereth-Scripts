
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilePlus2, LibraryBig } from 'lucide-react'; 
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'New Story', icon: FilePlus2, exact: true },
  { href: '/library', label: 'Library', icon: LibraryBig },
];

export function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border shadow-2xl z-40 md:hidden backdrop-blur-sm">
      <div className="container mx-auto flex justify-around items-stretch h-16 max-w-md">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 flex-1 rounded-none transition-all duration-200 ease-in-out relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary active:scale-95"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-6 w-6 mb-0.5 transition-transform duration-200 ease-out", isActive && "scale-110 fill-primary/20", !isActive && "group-hover:scale-110")} aria-hidden="true" />
              <span className={cn("text-xs font-medium transition-colors", isActive ? "text-primary" : "group-hover:text-primary")}>{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-b-full transition-all duration-300 ease-out"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
