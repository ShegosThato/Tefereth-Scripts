'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoryInputForm, type StoryFormValues } from '@/components/app/StoryInputForm';
import { createProject } from '@/lib/project-store';
import { useToast } from '@/hooks/use-toast';
import { analyzeStory, type AnalyzeStoryInput } from '@/ai/flows/analyze-story';
import { updateProject } from '@/lib/project-store'; // Import updateProject

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: StoryFormValues) => {
    setIsLoading(true);
    try {
      // 1. Create initial project structure
      const newProject = createProject(values.title, values.storyText);
      
      // 2. Call AI for story analysis
      const analysisInput: AnalyzeStoryInput = { storyText: values.storyText };
      const analysisResult = await analyzeStory(analysisInput);

      // 3. Update project with analysis results
      updateProject(newProject.id, { analysis: analysisResult });

      toast({
        title: "Story Analyzed!",
        description: "Your project has been created and story analysis is complete.",
      });
      router.push(`/project/${newProject.id}`);
    } catch (error) {
      console.error("Error creating project or analyzing story:", error);
      toast({
        title: "Error",
        description: "Failed to create project or analyze story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8">
      <StoryInputForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
