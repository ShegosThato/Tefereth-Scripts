
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Scene, StoryboardScene } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, RefreshCw, Check, X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SceneCardProps {
  scene: Scene | StoryboardScene;
  index: number;
  type?: 'storyboard' | 'generated';
  onDescriptionSave: (newDescription: string) => void;
  onRegenerate: () => void;
  isSorting?: boolean;
}

export function SceneCard({ scene, index, type = 'storyboard', onDescriptionSave, onRegenerate, isSorting = false }: SceneCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(scene.sceneDescription);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: scene.sceneDescription + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  const imageUrl = 'imageUrl' in scene ? scene.imageUrl : scene.imageUri;
  const altText = `Visual for scene ${index + 1}: ${scene.sceneDescription.substring(0, 50)}...`;
  const dataAiHintForPlaceholder = type === 'storyboard' ? "storyboard frame" : "generated scene";

  const handleSave = () => {
    onDescriptionSave(description);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDescription(scene.sceneDescription);
    setIsEditing(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ease-in-out group border-border/70 transform hover:-translate-y-1 hover:scale-[1.02]",
        isDragging && "shadow-2xl scale-105"
      )}
    >
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
            <ImageIcon className="h-12 w-12 mb-2 opacity-30 group-hover:opacity-50 transition-opacity" />
            <p className="text-xs text-center">No image available for this scene.</p>
             <Image 
                src={`https://placehold.co/400x225.png`} 
                alt="Placeholder image for scene" 
                fill 
                className="object-cover opacity-0 pointer-events-none"
                data-ai-hint={dataAiHintForPlaceholder} 
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
          </div>
        )}
         <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-md transition-opacity duration-200 group-hover:opacity-80">
          Scene {index + 1}
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           {type === 'generated' && (
              <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/50 hover:bg-black/80 text-white hover:text-primary backdrop-blur-sm" onClick={onRegenerate} aria-label="Regenerate scene">
                <RefreshCw className="h-4 w-4"/>
              </Button>
            )}
            <button
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder scene"
                className={cn("h-8 w-8 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white hover:text-primary backdrop-blur-sm rounded-md cursor-grab active:cursor-grabbing",
                  isSorting ? "cursor-grab" : "cursor-not-allowed opacity-50"
                )}
                disabled={!isSorting}
              >
              <GripVertical className="h-4 w-4"/>
            </button>
        </div>
      </div>
      <CardContent className="p-4 bg-card/80" onClick={() => !isEditing && setIsEditing(true)}>
        {isEditing ? (
            <div className="space-y-2">
                <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-sm leading-relaxed"
                    rows={4}
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={handleCancel}><X className="h-4 w-4"/></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:bg-green-500/10" onClick={handleSave}><Check className="h-4 w-4"/></Button>
                </div>
            </div>
        ) : (
            <p className="text-sm line-clamp-3 leading-relaxed cursor-pointer" title="Click to edit description">
                {scene.sceneDescription || "No description for this scene."}
            </p>
        )}
      </CardContent>
    </Card>
  );
}
