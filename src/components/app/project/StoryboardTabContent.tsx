
'use client';

import { useState } from 'react';
import type { Scene, Storyboard } from '@/lib/types';
import { visualStyles } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProjectStore } from '@/stores/project-store';
import { generateStoryboard, type GenerateStoryboardInput } from '@/ai/flows/generate-storyboard';
import { generateScenes, type GenerateScenesInput } from '@/ai/flows/generate-scenes';
import { VisualStyleSelector } from './VisualStyleSelector';
import { SceneCard } from './SceneCard';
import { LoadingSpinner } from '@/components/app/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, ImagePlay, Clapperboard, Check, AlertTriangle, Palette } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';


export function StoryboardTabContent() {
  const { toast } = useToast();
  const { 
    currentProject: project, 
    updateCurrentProject,
    setLoading, 
    isLoading 
  } = useProjectStore();

  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [isGeneratingScenes, setIsGeneratingScenes] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!project) return <LoadingSpinner text="Loading project data..."/>;

  const handleGenerateStoryboard = async () => {
    if (!project.analysis) {
      toast({ title: "Analysis Missing", description: "Story analysis is required to generate a storyboard.", variant: "destructive" });
      return;
    }
    setIsGeneratingStoryboard(true);
    setLoading(true);
    try {
      const input: GenerateStoryboardInput = {
        storyAnalysis: JSON.stringify(project.analysis),
        userPrompts: `Generate a storyboard for the story titled "${project.title}". Focus on key visual moments.`,
      };
      const storyboardResult = await generateStoryboard(input);
      await updateCurrentProject({ storyboard: storyboardResult, generatedScenes: [] }); // Clear old scenes
      toast({ title: "Storyboard Generated!", description: "AI has created scene descriptions." });
    } catch (error) {
      console.error("Error generating storyboard:", error);
      toast({ title: "Storyboard Error", description: "Failed to generate storyboard. Check console for details.", variant: "destructive" });
    } finally {
      setIsGeneratingStoryboard(false);
      setLoading(false);
    }
  };

  const handleSelectStyle = async (styleId: string) => {
    await updateCurrentProject({ visualStyle: styleId });
  };

  const handleGenerateScenes = async () => {
    if (!project.storyboard || project.storyboard.length === 0) {
      toast({ title: "Storyboard Required", description: "Please generate a storyboard first.", variant: "destructive" });
      return;
    }
    if (!project.visualStyle) {
      toast({ title: "Visual Style Required", description: "Please select a visual style.", variant: "destructive" });
      return;
    }

    const style = visualStyles.find(s => s.id === project.visualStyle);
    if (!style) {
        toast({ title: "Invalid Style", description: "Selected visual style not found.", variant: "destructive" });
        return;
    }

    setIsGeneratingScenes(true);
    setLoading(true);
    try {
      const input: GenerateScenesInput = {
        storyboard: project.storyboard,
        visualStyle: style.promptFragment,
      };
      const generatedScenesResult = await generateScenes(input);
      await updateCurrentProject({ generatedScenes: generatedScenesResult.scenes });
      toast({ title: "Scenes Generated!", description: "AI has created visual scenes for your storyboard." });
    } catch (error) {
      console.error("Error generating scenes:", error);
      toast({ title: "Scene Generation Error", description: "Failed to generate scenes. Check console for details.", variant: "destructive" });
    } finally {
      setIsGeneratingScenes(false);
      setLoading(false);
    }
  };

  const handleDescriptionSave = async (index: number, newDescription: string, type: 'storyboard' | 'generated') => {
    if (type === 'storyboard' && project.storyboard) {
      const updatedStoryboard = [...project.storyboard];
      updatedStoryboard[index] = newDescription;
      await updateCurrentProject({ storyboard: updatedStoryboard });
    } else if (type === 'generated' && project.generatedScenes) {
      const updatedScenes = [...project.generatedScenes];
      updatedScenes[index].sceneDescription = newDescription;
      await updateCurrentProject({ generatedScenes: updatedScenes });
    }
    toast({ title: "Scene Updated", description: "Scene description has been saved."});
  };

  const handleSceneRegenerate = async (index: number) => {
    if (!project.generatedScenes || !project.visualStyle) {
        toast({ title: "Data missing", description: "Cannot regenerate without scenes and a visual style.", variant: "destructive"});
        return;
    }
    const style = visualStyles.find(s => s.id === project.visualStyle);
    if (!style) return;

    setLoading(true);
    try {
        const sceneToRegen = project.generatedScenes[index];
        const input: GenerateScenesInput = {
            storyboard: [sceneToRegen.sceneDescription], // Send only the specific description
            visualStyle: style.promptFragment,
        };
        const result = await generateScenes(input);
        if (result.scenes && result.scenes.length > 0) {
            const updatedScenes = [...project.generatedScenes];
            updatedScenes[index] = result.scenes[0];
            await updateCurrentProject({ generatedScenes: updatedScenes });
            toast({ title: "Scene Regenerated", description: `Scene ${index + 1} has been updated with a new image.`});
        }
    } catch(error) {
        console.error("Error regenerating scene:", error);
        toast({ title: "Regeneration Error", description: "Could not regenerate the scene.", variant: "destructive"});
    } finally {
        setLoading(false);
    }
  };

  function handleDragEnd(event: DragEndEvent, type: 'storyboard' | 'generated') {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const items = type === 'storyboard' ? project.storyboard : project.generatedScenes;
      if (!items) return;
      
      const oldIndex = items.findIndex((item, i) => (typeof item === 'string' ? item + i : item.sceneDescription + i) === active.id);
      const newIndex = items.findIndex((item, i) => (typeof item === 'string' ? item + i : item.sceneDescription + i) === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(items, oldIndex, newIndex);
      if (type === 'storyboard') {
          updateCurrentProject({ storyboard: newOrder as Storyboard });
      } else {
          updateCurrentProject({ generatedScenes: newOrder as Scene[] });
      }
    }
  }

  const currentStoryboard = project.storyboard || [];
  const currentGeneratedScenes = project.generatedScenes || [];
  const canGenerateScenes = currentStoryboard.length > 0 && project.visualStyle;

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
              ? `Your storyboard has ${currentStoryboard.length} scene descriptions. You can regenerate, edit, or drag to reorder them.`
              : "Let AI create scene descriptions from your story analysis."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateStoryboard} disabled={isGeneratingStoryboard || isLoading || !project.analysis} size="lg" className="text-base px-6 py-3 shadow-md hover:shadow-lg">
            {isGeneratingStoryboard ? (
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
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'storyboard')}>
                <SortableContext items={currentStoryboard.map((desc, i) => desc + i)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentStoryboard.map((description, index) => (
                          <SceneCard 
                            key={`storyboard-${project.id}-${index}`} 
                            id={description + index}
                            description={description}
                            index={index} 
                            type="storyboard"
                            onDescriptionSave={(desc) => handleDescriptionSave(index, desc, 'storyboard')}
                            onRegenerate={()=>{}} // No regen for storyboard
                            isSorting={true}
                          />
                        ))}
                    </div>
                </SortableContext>
              </DndContext>
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
              <VisualStyleSelector selectedStyleId={project.visualStyle} onSelectStyle={handleSelectStyle} />
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
                  ? `You have ${currentGeneratedScenes.length} scenes generated with the selected style. Edit, reorder, or regenerate them.`
                  : "Apply the chosen style to generate unique images for each storyboard scene."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!project.visualStyle && (
                <div className="mb-4 p-4 bg-yellow-500/10 text-yellow-800 dark:bg-yellow-700/20 dark:text-yellow-300 border border-yellow-600/30 dark:border-yellow-500/40 rounded-md flex items-center gap-2 text-sm shadow">
                  <AlertTriangle className="h-5 w-5" />
                  Please select a visual style above to enable scene generation.
                </div>
              )}
              <Button onClick={handleGenerateScenes} disabled={isGeneratingScenes || isLoading || !canGenerateScenes} size="lg" className="text-base px-6 py-3 shadow-md hover:shadow-lg">
                {isGeneratingScenes ? (
                  <LoadingSpinner text="Generating Scenes..." />
                ) : (
                  <>
                    <ImagePlay className="mr-2 h-5 w-5" />
                    {currentGeneratedScenes.length > 0 ? "Regenerate All Scenes" : "Generate Scenes"}
                  </>
                )}
              </Button>
              {currentGeneratedScenes.length > 0 && (
                <div className="mt-8 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Generated Scenes ({currentGeneratedScenes.length}):</h3>
                   <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'generated')}>
                    <SortableContext items={currentGeneratedScenes.map((s, i) => s.sceneDescription + i)} strategy={verticalListSortingStrategy}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentGeneratedScenes.map((scene, index) => (
                          <SceneCard 
                            key={`generated-${project.id}-${index}`} 
                            id={scene.sceneDescription + index}
                            description={scene.sceneDescription}
                            imageUrl={scene.imageUrl}
                            index={index} 
                            type="generated"
                            onDescriptionSave={(desc) => handleDescriptionSave(index, desc, 'generated')}
                            onRegenerate={() => handleSceneRegenerate(index)}
                            isSorting={true}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
