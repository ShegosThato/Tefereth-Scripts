import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/app/AppHeader';
import { BottomNavigationBar } from '@/components/app/BottomNavigationBar';
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: 'StorySpark: AI Video Producer',
  description: 'AI-powered video creation from your stories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        <AppHeader />
        <main className="flex-grow container mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8"> {/* Adjusted padding-bottom for BottomNav */}
          {children}
        </main>
        <BottomNavigationBar />
        <Toaster />
        
      </body>
    </html>
  );
}
