
'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { analyzeStory, type AnalyzeStoryInput } from '@/ai/flows/analyze-story';
import { StoryInputForm, type StoryFormValues } from '@/components/app/StoryInputForm';
import { useToast } from '@/hooks/use-toast';
import { useProjectStore } from '@/stores/project-store';

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isSignedIn, userId } = useAuth();
  const { addProject, isLoading } = useProjectStore();

  const handleSubmit = async (values: StoryFormValues) => {
    if (!isSignedIn || !userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in or create an account to start a new project.',
        variant: 'destructive',
      });
      router.push('/sign-in');
      return;
    }

    let storyContent = values.storyText;

    // Also check for whitespace-only content
    if (!storyContent || storyContent.trim().length === 0) {
      toast({
        title: 'Missing Story Content',
        description: 'Please provide story text or upload a supported document (.txt, .md) with content.',
        variant: 'destructive',
      });
      return;
    }

    if (storyContent.length > 50000) {
      toast({
        title: 'Story Too Long',
        description: 'The story content exceeds the 50,000 character limit. Please shorten it or use a smaller file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Use the trimmed content for analysis to avoid issues with leading/trailing whitespace
      const analysisInput: AnalyzeStoryInput = { storyText: storyContent.trim() };
      const analysisResult = await analyzeStory(analysisInput);

      const newProjectId = await addProject(
        {
          title: values.title,
          storyText: storyContent,
          analysis: analysisResult,
        },
        userId
      );

      if (newProjectId) {
        toast({
          title: 'Project Created & Analyzed!',
          description: 'Your story analysis is complete. Redirecting to your project...',
        });
        router.push(`/project/${newProjectId}`);
      } else {
        throw new Error('Failed to create project and get an ID back.');
      }
    } catch (error: any) {
      console.error('Error creating project or analyzing story:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'AI processing limit reached. Please try again later.';
        } else if (error.message.includes('SAFETY')) {
          errorMessage = 'The story content was blocked by AI safety filters. Please revise your story.';
        } else if (error.message.includes('10000 characters')) {
          errorMessage = 'Story text for analysis cannot exceed 10,000 characters. Please shorten it.';
        } else {
          errorMessage = error.message;
        }
      }
      toast({
        title: 'Operation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="py-8 md:py-12 animate-in fade-in-0 duration-500">
      <StoryInputForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
