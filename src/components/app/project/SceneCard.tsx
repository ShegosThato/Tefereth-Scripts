
'use client';

import Image from 'next/image';
import type { Scene } from '@/lib/types';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
  index: number;
  type?: 'storyboard' | 'generated';
}

export function SceneCard({ scene, index, type = 'storyboard' }: SceneCardProps) {
  const imageUrl = scene.imageUrl || scene.storyboardImageUri;
  const altText = `Visual for scene ${index + 1}: ${scene.sceneDescription.substring(0, 50)}...`;
  const dataAiHintForPlaceholder = type === 'storyboard' ? "storyboard frame" : "generated scene";

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 group border-border">
      <div className="aspect-video w-full bg-muted/30 relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4">
            <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-xs text-center">No image available for this scene.</p>
             <Image src={`https://placehold.co/400x225.png`} alt="Placeholder" fill className="object-cover opacity-0" data-ai-hint={dataAiHintForPlaceholder} />
          </div>
        )}
         <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
          Scene {index + 1}
        </div>
      </div>
      <CardContent className="p-4">
        <CardDescription className="text-sm line-clamp-3 leading-relaxed" title={scene.sceneDescription}>
          {scene.sceneDescription || "No description for this scene."}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
