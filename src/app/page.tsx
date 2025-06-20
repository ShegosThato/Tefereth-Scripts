
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoryInputForm, type StoryFormValues } from '@/components/app/StoryInputForm';
import { createProject, updateProject } from '@/lib/project-store';
import { useToast } from '@/hooks/use-toast';
import { analyzeStory, type AnalyzeStoryInput } from '@/ai/flows/analyze-story';

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: StoryFormValues) => {
    setIsLoading(true);
    let storyContent = values.storyText;

    if (!storyContent || storyContent.trim().length === 0) {
        toast({
            title: "Missing Story Content",
            description: "Please provide story text or upload a supported document (.txt, .md) with content.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    if (storyContent.length > 50000) { // Zod schema also handles this, but belt-and-suspenders
        toast({
            title: "Story Too Long",
            description: "The story content exceeds the 50,000 character limit. Please shorten it or use a smaller file.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    try {
      const newProject = createProject(values.title, storyContent);
      
      const analysisInput: AnalyzeStoryInput = { storyText: storyContent };
      const analysisResult = await analyzeStory(analysisInput);

      updateProject(newProject.id, { analysis: analysisResult });

      toast({
        title: "Project Created & Analyzed!",
        description: "Your story analysis is complete. Redirecting to your project...",
      });
      router.push(`/project/${newProject.id}`);
    } catch (error) {
      console.error("Error creating project or analyzing story:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("quota") || error.message.includes("limit")) {
          errorMessage = "AI processing limit reached. Please try again later.";
        } else if (error.message.includes("SAFETY")) {
            errorMessage = "The story content was blocked by AI safety filters. Please revise your story.";
        } else if (error.message.includes("10000 characters")) { // Specific error from analyzeStory flow
            errorMessage = "Story text for analysis cannot exceed 10,000 characters. Please shorten it.";
        }
      }
      toast({
        title: "Operation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <StoryInputForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
