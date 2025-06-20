
'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/sign-in');
  };

  const handleGoToLibrary = () => {
    router.push('/library');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4 animate-in fade-in-50 duration-500">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
        Bring Your Stories to Life
      </h1>
      <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
        Turn your scripts and stories into stunning visual experiences with AI-powered storyboarding and video creation.
      </p>
      {isSignedIn ? (
        <Button size="lg" onClick={handleGoToLibrary}>
          Go to Your Library
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      ) : (
        <Button size="lg" onClick={handleGetStarted}>
          Get Started for Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
