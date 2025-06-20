
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StoryInputForm, type StoryFormValues } from '@/components/app/StoryInputForm';
import { createProject, updateProject } from '@/lib/project-store';
import { useToast } from '@/hooks/use-toast';
import { analyzeStory, type AnalyzeStoryInput } from '@/ai/flows/analyze-story';

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: StoryFormValues) => {
    setIsLoading(true);
    let storyContent = values.storyText;

    // The form logic already attempts to put .txt/.md content into storyText.
    // This handleSubmit will primarily use values.storyText.
    // If a non-txt/md file was selected, values.storyText might be empty
    // and the user should have been notified by the form component.

    if (!storyContent || storyContent.trim().length === 0) {
        toast({
            title: "Missing Story",
            description: "Please provide story text or upload a supported document (.txt, .md) with content.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    // Character limit check already handled by Zod schema if storyContent is from textarea/file.
    // Additional check for safety, though schema should catch it.
    if (storyContent.length > 50000) {
        toast({
            title: "Story Too Long",
            description: "The story content exceeds the 50,000 character limit. Please shorten it.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }


    try {
      // 1. Create initial project structure
      // Use storyContent which is populated either by textarea or file reader in the form component
      const newProject = createProject(values.title, storyContent);
      
      // 2. Call AI for story analysis
      const analysisInput: AnalyzeStoryInput = { storyText: storyContent };
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
      let errorMessage = "Failed to create project or analyze story. Please try again.";
      if (error instanceof Error) {
        // Check for specific Genkit / AI related errors if possible
        if (error.message.includes("quota") || error.message.includes("limit")) {
          errorMessage = "AI processing limit reached. Please try again later.";
        } else if (error.message.includes("SAFETY")) {
            errorMessage = "The story content was blocked by safety filters. Please revise your story.";
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
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
