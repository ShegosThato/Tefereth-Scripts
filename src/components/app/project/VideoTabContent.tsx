'use client';

import { useState } from 'react';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SceneCard } from './SceneCard';
import { LoadingSpinner } from '@/components/app/LoadingSpinner';
import { Film, Download, Share2, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface VideoTabContentProps {
  project: Project;
}

export function VideoTabContent({ project }: VideoTabContentProps) {
  const [isAssembling, setIsAssembling] = useState(false);
  const [videoReady, setVideoReady] = useState(!!project.videoUrl); // Check if videoUrl already exists
  const { toast } = useToast();

  const handleAssembleVideo = () => {
    if (!project.generatedScenes || project.generatedScenes.length === 0) {
      toast({ title: "No Scenes", description: "Please generate scenes before assembling the video.", variant: "destructive"});
      return;
    }
    setIsAssembling(true);
    // Simulate video assembly
    setTimeout(() => {
      // In a real app, this would involve an actual video processing backend.
      // Here, we just mock it.
      // You could update the project state with a mock video URL:
      // const mockVideoUrl = "https://placehold.co/1280x720.mp4"; // Placeholder video
      // updateProject(project.id, { videoUrl: mockVideoUrl }); 
      // onProjectUpdate({...project, videoUrl: mockVideoUrl });
      
      setVideoReady(true);
      setIsAssembling(false);
      toast({ title: "Video Assembled!", description: "Your video is ready for preview and export." });
    }, 3000);
  };

  const scenesToDisplay = project.generatedScenes || project.storyboard || [];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <Film className="mr-3 h-7 w-7 text-primary" />
            Final Video
          </CardTitle>
          <CardDescription>
            {videoReady 
              ? "Your video is assembled and ready for export!"
              : "Assemble your generated scenes into a final video."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!videoReady ? (
            <Button onClick={handleAssembleVideo} disabled={isAssembling || scenesToDisplay.length === 0} size="lg">
              {isAssembling ? (
                <LoadingSpinner text="Assembling Video..." />
              ) : (
                <>
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Assemble Video
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {/* Mock video player or preview */}
                 <Image src={project.generatedScenes?.[0]?.imageUrl || "https://placehold.co/1280x720.png"} alt="Video Preview" width={1280} height={720} className="w-full h-full object-cover" data-ai-hint="video play button" />
              </div>
              <p className="text-center text-green-600 font-semibold">Video processing complete!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="default" onClick={() => toast({title: "Download Started", description: "Your video download will begin shortly."})}>
                  <Download className="mr-2 h-5 w-5" /> Download Video
                </Button>
                <Button size="lg" variant="outline" onClick={() => toast({title: "Sharing Options", description: "Sharing functionality coming soon!"})}>
                  <Share2 className="mr-2 h-5 w-5" /> Share
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {scenesToDisplay.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Video Scenes Overview</CardTitle>
            <CardDescription>These are the scenes that will be (or are) included in your video.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {scenesToDisplay.map((scene, index) => (
                <div key={index} className="aspect-video bg-muted rounded overflow-hidden relative group">
                   <Image 
                    src={scene.imageUrl || scene.storyboardImageUri || "https://placehold.co/160x90.png"} 
                    alt={`Scene ${index + 1}`} 
                    width={160} 
                    height={90} 
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    data-ai-hint="video scene"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate">
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
