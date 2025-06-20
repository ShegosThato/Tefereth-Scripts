
import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/app/AppHeader';
import { BottomNavigationBar } from '@/components/app/BottomNavigationBar';
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Tefereth Scripts',
  description: 'AI-powered video creation from your stories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { 
          colorPrimary: 'hsl(0 84% 60%)',
          colorBackground: 'hsl(0 0% 8%)',
          colorText: 'hsl(0 0% 95%)',
          colorInputBackground: 'hsl(0 0% 18%)',
          colorInputText: 'hsl(0 0% 95%)',
        },
        elements: {
          userButtonPopoverCard: 'bg-popover text-popover-foreground border-border',
          userButtonPopoverActionButton: 'text-popover-foreground',
          card: 'bg-card text-card-foreground border-border shadow-lg',
          formFieldInput: 'bg-input text-foreground border-border',
        }
      }}
    >
      <html lang="en" className="h-full" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const theme = localStorage.getItem('theme');
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (theme === 'dark' || (!theme && prefersDark)) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {
                    console.warn('Could not set initial theme:', e);
                  }
                })();
              `,
            }}
          />
        </head>
        <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/70 selection:text-primary-foreground">
          <AppHeader />
          <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
            {children}
          </main>
          <BottomNavigationBar />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
