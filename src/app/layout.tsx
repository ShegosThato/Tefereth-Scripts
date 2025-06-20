
import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/app/AppHeader';
import { BottomNavigationBar } from '@/components/app/BottomNavigationBar';
import { Toaster } from "@/components/ui/toaster";

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
                  // Fallback for environments where localStorage or matchMedia might not be available
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
  );
}
