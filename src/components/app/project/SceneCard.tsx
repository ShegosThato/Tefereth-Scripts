'use client';

import Image from 'next/image';
import type { Scene } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ImageIcon, Edit3, Trash2 } from 'lucide-react'; // Placeholder for actions
import { Button } from '@/components/ui/button';

interface SceneCardProps {
  scene: Scene;
  index: number;
  // onEdit?: (index: number) => void;
  // onDelete?: (index: number) => void;
  type?: 'storyboard' | 'generated';
}

export function SceneCard({ scene, index, type = 'storyboard' }: SceneCardProps) {
  const imageUrl = scene.imageUrl || scene.storyboardImageUri;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 group">
      <div className="aspect-video w-full bg-muted/50 relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Scene ${index + 1}: ${scene.sceneDescription}`}
            width={400} // Fixed width
            height={225} // Fixed height for 16:9 aspect ratio
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-16 w-16 mb-2" />
            <p className="text-sm">No image available</p>
          </div>
        )}
         <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          Scene {index + 1}
        </div>
      </div>
      <CardContent className="p-3">
        <CardDescription className="text-sm line-clamp-3 leading-relaxed" title={scene.sceneDescription}>
          {scene.sceneDescription}
        </CardDescription>
      </CardContent>
      {/* Optional: Add footer for actions like edit/delete scene
      <CardFooter className="p-3 border-t flex justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => onEdit?.(index)} aria-label="Edit scene">
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDelete?.(index)} aria-label="Delete scene">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
      */}
    </Card>
  );
}
