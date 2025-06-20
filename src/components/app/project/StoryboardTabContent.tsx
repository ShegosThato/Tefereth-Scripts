
'use client';

import { useState } from 'react';
import type { Project, Scene as AppScene } from '@/lib/types';
import { visualStyles } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateStoryboard, type GenerateStoryboardInput } from '@/ai/flows/generate-storyboard';
import { generateScenes, type GenerateScenesInput } from '@/ai/flows/generate-scenes';
import { VisualStyleSelector } from './VisualStyleSelector';
import { SceneCard } from './SceneCard';
import { LoadingSpinner } from '@/components/app/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, ImagePlay, Clapperboard, Check, AlertTriangle, Palette } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface StoryboardTabContentProps {
  project: Project;
  onProjectUpdate: (updatedProjectData: Partial<Project>) => void;
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
        storyAnalysis: JSON.stringify(project.analysis),
        userPrompts: `Generate a storyboard for the story titled "${project.title}". Focus on key visual moments.`,
      };
      const storyboardResult = await generateStoryboard(input);
      onProjectUpdate({ storyboard: storyboardResult });
      toast({ title: "Storyboard Generated!", description: "AI has created a visual storyboard." });
    } catch (error) {
      console.error("Error generating storyboard:", error);
      toast({ title: "Storyboard Error", description: "Failed to generate storyboard. Check console for details.", variant: "destructive" });
    } finally {
      setIsLoadingStoryboard(false);
    }
  };

  const handleSelectStyle = (styleId: string) => {
    setSelectedVisualStyleId(styleId);
    onProjectUpdate({ visualStyle: styleId });
  };

  const handleGenerateScenes = async () => {
    if (!project.storyboard || project.storyboard.length === 0) {
      toast({ title: "Storyboard Required", description: "Please generate a storyboard first.", variant: "destructive" });
      return;
    }
    if (!selectedVisualStyleId) {
      toast({ title: "Visual Style Required", description: "Please select a visual style.", variant: "destructive" });
      return;
    }

    const style = visualStyles.find(s => s.id === selectedVisualStyleId);
    if (!style) {
        toast({ title: "Invalid Style", description: "Selected visual style not found.", variant: "destructive" });
        return;
    }

    setIsLoadingScenes(true);
    try {
      const storyboardDescription = project.storyboard.map(s => s.sceneDescription).join('\n');
      const input: GenerateScenesInput = {
        storyboardDescription,
        visualStyle: style.promptFragment,
      };
      const generatedScenesResult = await generateScenes(input);
      
      const appScenes: AppScene[] = generatedScenesResult.scenes.map(aiScene => ({
        sceneDescription: aiScene.sceneDescription,
        imageUrl: aiScene.imageUrl, 
      }));

      onProjectUpdate({ generatedScenes: appScenes });
      toast({ title: "Scenes Generated!", description: "AI has created visual scenes for your storyboard." });
    } catch (error) {
      console.error("Error generating scenes:", error);
      toast({ title: "Scene Generation Error", description: "Failed to generate scenes. Check console for details.", variant: "destructive" });
    } finally {
      setIsLoadingScenes(false);
    }
  };

  const currentStoryboard = project.storyboard || [];
  const currentGeneratedScenes = project.generatedScenes || [];
  const canGenerateScenes = currentStoryboard.length > 0 && selectedVisualStyleId;

  return (
    <div className="space-y-10">
      <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center text-foreground">
            <Clapperboard className="mr-3 h-7 w-7 text-primary" />
            Step 1: AI Storyboard
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {currentStoryboard.length > 0
              ? `Your storyboard has ${currentStoryboard.length} scenes. You can regenerate it if needed.`
              : "Let AI create a visual storyboard from your story analysis."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateStoryboard} disabled={isLoadingStoryboard || !project.analysis} size="lg" className="text-base px-6 py-3 shadow-md hover:shadow-lg">
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
            <div className="mt-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Storyboard Scenes ({currentStoryboard.length}):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStoryboard.map((scene, index) => (
                  <SceneCard key={`storyboard-${project.id}-${index}`} scene={scene} index={index} type="storyboard"/>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {currentStoryboard.length > 0 && (
        <>
          <Separator className="my-10 bg-border/50" />
          
          <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center text-foreground">
                <Palette className="mr-3 h-7 w-7 text-primary" />
                Step 2: Choose Visual Style
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Select a visual style to apply when generating your scenes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VisualStyleSelector selectedStyleId={selectedVisualStyleId} onSelectStyle={handleSelectStyle} />
            </CardContent>
          </Card>
          
          <Separator className="my-10 bg-border/50" />
          
          <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center text-foreground">
                <ImagePlay className="mr-3 h-7 w-7 text-primary" />
                Step 3: Generate Visual Scenes
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {currentGeneratedScenes.length > 0 
                  ? `You have ${currentGeneratedScenes.length} scenes generated with the selected style.`
                  : "Apply the chosen style to generate unique images for each storyboard scene."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedVisualStyleId && (
                <div className="mb-4 p-4 bg-yellow-500/10 text-yellow-800 dark:bg-yellow-700/20 dark:text-yellow-300 border border-yellow-600/30 dark:border-yellow-500/40 rounded-md flex items-center gap-2 text-sm shadow">
                  <AlertTriangle className="h-5 w-5" />
                  Please select a visual style above to enable scene generation.
                </div>
              )}
              <Button onClick={handleGenerateScenes} disabled={isLoadingScenes || !canGenerateScenes} size="lg" className="text-base px-6 py-3 shadow-md hover:shadow-lg">
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
                <div className="mt-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Generated Scenes ({currentGeneratedScenes.length}):</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentGeneratedScenes.map((scene, index) => (
                      <SceneCard key={`generated-${project.id}-${index}`} scene={scene} index={index} type="generated"/>
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
