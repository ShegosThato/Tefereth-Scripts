
'use client';

import { useState } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/app/LoadingSpinner';
import { Film, Download, Share2, PlayCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface VideoTabContentProps {}

export function VideoTabContent({}: VideoTabContentProps) {
  const { currentProject: project, updateCurrentProject, isLoading, setLoading } = useProjectStore();
  const [isAssembling, setIsAssembling] = useState(false);
  const { toast } = useToast();
  
  if (!project) return <LoadingSpinner />;

  const videoUrl = project.videoUrl;

  const handleAssembleVideo = async () => {
    if (!project.generatedScenes || project.generatedScenes.length === 0) {
      toast({ title: "No Scenes Available", description: "Please generate scenes before assembling the video.", variant: "destructive"});
      return;
    }
    setIsAssembling(true);
    setLoading(true);
    toast({ title: "Video Assembly Started", description: "This might take a few moments..." });
    
    // This is a mock assembly process
    setTimeout(async () => {
      const mockVideoUrl = `https://placehold.co/1280x720.mp4?text=Video+for+${encodeURIComponent(project.title)}`;
      await updateCurrentProject({ videoUrl: mockVideoUrl });
      setIsAssembling(false);
      setLoading(false);
      toast({ title: "Video Assembled!", description: "Your video is ready for preview and export." });
    }, 3000 + Math.random() * 2000); 
  };

  const scenesToDisplay = project.generatedScenes || [];

  return (
    <div className="space-y-10">
      <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center text-foreground">
            <Film className="mr-3 h-7 w-7 text-primary" />
            Final Video Production
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {videoUrl 
              ? "Your video is assembled! Preview below and use the export options."
              : "Assemble your generated scenes into the final video masterpiece."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!scenesToDisplay || scenesToDisplay.length === 0 ? (
             <div className="p-4 bg-yellow-500/10 text-yellow-800 dark:bg-yellow-700/20 dark:text-yellow-300 border border-yellow-600/30 dark:border-yellow-500/40 rounded-md flex items-center gap-3 text-sm shadow">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <p>No scenes have been generated for this project yet. Please go to the "Storyboard & Scenes" tab to generate scenes first.</p>
            </div>
          ) : !videoUrl ? (
            <Button onClick={handleAssembleVideo} disabled={isAssembling || isLoading} size="lg" className="w-full sm:w-auto text-base px-8 py-3 shadow-md hover:shadow-lg">
              {isAssembling ? (
                <LoadingSpinner text="Assembling Video..." />
              ) : (
                <>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Assemble Video from Scenes
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="aspect-video bg-muted/50 rounded-lg overflow-hidden shadow-inner flex items-center justify-center border border-border/50">
                 <Image 
                    src={project.generatedScenes?.[0]?.imageUrl || "https://placehold.co/1280x720.png"} 
                    alt="Video Preview Thumbnail" 
                    width={1280} 
                    height={720} 
                    className="w-full h-full object-contain bg-black" 
                    data-ai-hint="video player interface" 
                  />
              </div>
              <p className="text-center text-green-600 dark:text-green-400 font-semibold text-lg">
                Video processing complete!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                    size="lg" 
                    variant="default" 
                    onClick={() => {
                        if(videoUrl) window.open(videoUrl, '_blank');
                        toast({title: "Download Initiated", description: "Your video would start downloading (placeholder)."})
                    }}
                    className="text-base px-6 py-3 shadow-md hover:shadow-lg"
                    aria-label="Download video"
                >
                  <Download className="mr-2 h-5 w-5" /> Download Video
                </Button>
                <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => toast({title: "Share Options", description: "Sharing functionality coming soon!"})}
                    className="text-base px-6 py-3 shadow-sm hover:shadow-md"
                    aria-label="Share video"
                >
                  <Share2 className="mr-2 h-5 w-5" /> Share Video
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {scenesToDisplay.length > 0 && (
        <Card className="shadow-md border-border/70 transform transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-foreground">Video Scenes Overview ({scenesToDisplay.length})</CardTitle>
            <CardDescription className="text-muted-foreground">These are the scenes that will be (or are) included in your video.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {scenesToDisplay.map((scene, index) => (
                <div key={`video-scene-${index}`} className="aspect-video bg-muted/50 rounded overflow-hidden relative group shadow-sm border-border/50 transform transition-all duration-200 hover:scale-105 hover:shadow-md">
                   <Image 
                    src={scene.imageUrl || scene.storyboardImageUri || "https://placehold.co/160x90.png"} 
                    alt={`Scene ${index + 1} thumbnail`} 
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    data-ai-hint="video scene thumbnail"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1.5 text-center truncate backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                    Scene {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
