'use client';

import { useState } from 'react';
import type { Project, Scene as AppScene, VisualStyle } from '@/lib/types'; // Renamed Scene to AppScene
import { visualStyles } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateStoryboard, type GenerateStoryboardInput } from '@/ai/flows/generate-storyboard';
import { generateScenes, type GenerateScenesInput } from '@/ai/flows/generate-scenes';
import { updateProject as saveProjectDetails } from '@/lib/project-store';
import { VisualStyleSelector } from './VisualStyleSelector';
import { SceneCard } from './SceneCard';
import { LoadingSpinner } from '@/components/app/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, ImagePlay, Clapperboard, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface StoryboardTabContentProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

export function StoryboardTabContent({ project, onProjectUpdate }: StoryboardTabContentProps) {
  const { toast } = useToast();
  const [isLoadingStoryboard, setIsLoadingStoryboard] = useState(false);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);
  const [selectedVisualStyleId, setSelectedVisualStyleId] = useState<string | undefined>(project.visualStyle);

  const handleGenerateStoryboard = async () => {
    if (!project.analysis) {
      toast({ title: "Analysis Missing", description: "Story analysis is required to generate a storyboard.", variant: "destructive" });
      return;
    }
    setIsLoadingStoryboard(true);
    try {
      const input: GenerateStoryboardInput = {
        storyAnalysis: JSON.stringify(project.analysis), // Assuming analysis is an object
        userPrompts: `Generate a storyboard for the story titled "${project.title}". Focus on key visual moments.`,
      };
      const storyboardResult = await generateStoryboard(input);
      const updatedProject = { ...project, storyboard: storyboardResult };
      saveProjectDetails(project.id, { storyboard: storyboardResult });
      onProjectUpdate(updatedProject);
      toast({ title: "Storyboard Generated!", description: "AI has created a visual storyboard for your project." });
    } catch (error) {
      console.error("Error generating storyboard:", error);
      toast({ title: "Storyboard Error", description: "Failed to generate storyboard. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingStoryboard(false);
    }
  };

  const handleSelectStyle = (styleId: string) => {
    setSelectedVisualStyleId(styleId);
    const updatedProject = { ...project, visualStyle: styleId };
    saveProjectDetails(project.id, { visualStyle: styleId });
    onProjectUpdate(updatedProject);
  };

  const handleGenerateScenes = async () => {
    if (!project.storyboard || project.storyboard.length === 0) {
      toast({ title: "Storyboard Missing", description: "Please generate a storyboard first.", variant: "destructive" });
      return;
    }
    if (!selectedVisualStyleId) {
      toast({ title: "Visual Style Missing", description: "Please select a visual style.", variant: "destructive" });
      return;
    }

    const style = visualStyles.find(s => s.id === selectedVisualStyleId);
    if (!style) {
        toast({ title: "Invalid Visual Style", description: "Selected visual style not found.", variant: "destructive" });
        return;
    }

    setIsLoadingScenes(true);
    try {
      // Combine scene descriptions from the storyboard
      const storyboardDescription = project.storyboard.map(s => s.sceneDescription).join('\n');
      
      const input: GenerateScenesInput = {
        storyboardDescription,
        visualStyle: style.promptFragment, // Use the prompt fragment from the selected style
      };
      // The AI flow 'generateScenes' returns an object { scenes: Scene[] }
      // where Scene is { sceneDescription: string, imageUrl: string }
      const generatedScenesResult = await generateScenes(input);
      
      // Map AI flow output to our AppScene type.
      // The AI flow's `scenes` property holds an array of { sceneDescription, imageUrl }
      const appScenes: AppScene[] = generatedScenesResult.scenes.map(aiScene => ({
        sceneDescription: aiScene.sceneDescription,
        imageUrl: aiScene.imageUrl,
      }));

      const updatedProject = { ...project, generatedScenes: appScenes };
      saveProjectDetails(project.id, { generatedScenes: appScenes });
      onProjectUpdate(updatedProject);
      toast({ title: "Scenes Generated!", description: "AI has created visual scenes for your storyboard." });
    } catch (error) {
      console.error("Error generating scenes:", error);
      toast({ title: "Scene Generation Error", description: "Failed to generate scenes. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingScenes(false);
    }
  };

  const currentStoryboard = project.storyboard || [];
  const currentGeneratedScenes = project.generatedScenes || [];

  return (
    <div className="space-y-8">
      {/* Storyboard Generation Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Clapperboard className="mr-3 h-7 w-7 text-primary" />
            AI Storyboard
          </CardTitle>
          <CardDescription>
            {currentStoryboard.length > 0
              ? `Your storyboard has ${currentStoryboard.length} scenes. You can regenerate it if needed.`
              : "Let our AI create a visual storyboard from your story analysis."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateStoryboard} disabled={isLoadingStoryboard || !project.analysis} size="lg">
            {isLoadingStoryboard ? (
              <LoadingSpinner text="Generating Storyboard..." />
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                {currentStoryboard.length > 0 ? "Regenerate Storyboard" : "Generate Storyboard"}
              </>
            )}
          </Button>
          {currentStoryboard.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">Storyboard Scenes:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStoryboard.map((scene, index) => (
                  <SceneCard key={`storyboard-${index}`} scene={scene} index={index} type="storyboard"/>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {currentStoryboard.length > 0 && (
        <>
          <Separator />
          {/* Visual Style Selection Section */}
          <VisualStyleSelector selectedStyleId={selectedVisualStyleId} onSelectStyle={handleSelectStyle} />
          
          <Separator />
          {/* Scene Generation Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center">
                <ImagePlay className="mr-3 h-7 w-7 text-primary" />
                Generate Visual Scenes
              </CardTitle>
              <CardDescription>
                {currentGeneratedScenes.length > 0 
                  ? `You have ${currentGeneratedScenes.length} scenes generated with the selected style. You can regenerate them.`
                  : "Apply the chosen visual style to generate unique images for each storyboard scene."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerateScenes} disabled={isLoadingScenes || !selectedVisualStyleId} size="lg">
                {isLoadingScenes ? (
                  <LoadingSpinner text="Generating Scenes..." />
                ) : (
                  <>
                    <ImagePlay className="mr-2 h-5 w-5" />
                    {currentGeneratedScenes.length > 0 ? "Regenerate Scenes" : "Generate Scenes"}
                  </>
                )}
              </Button>
              {currentGeneratedScenes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Generated Scenes:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentGeneratedScenes.map((scene, index) => (
                      <SceneCard key={`generated-${index}`} scene={scene} index={index} type="generated"/>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
