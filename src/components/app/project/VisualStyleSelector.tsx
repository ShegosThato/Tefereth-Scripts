'use client';

import Image from 'next/image';
import type { VisualStyle } from '@/lib/types';
import { visualStyles } from '@/lib/types'; // Import the predefined styles
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualStyleSelectorProps {
  selectedStyleId?: string;
  onSelectStyle: (styleId: string) => void;
}

export function VisualStyleSelector({ selectedStyleId, onSelectStyle }: VisualStyleSelectorProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Choose a Visual Style</CardTitle>
        <CardDescription>Select a style to apply to your generated scenes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visualStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              aria-pressed={selectedStyleId === style.id}
              className={cn(
                "relative group rounded-lg border-2 p-1 focus:outline-none transition-all duration-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedStyleId === style.id ? "border-primary shadow-2xl scale-105" : "border-transparent hover:border-primary/50"
              )}
            >
              <div className="aspect-video w-full overflow-hidden rounded-md mb-2 relative">
                 <Image
                    src={style.previewImageUrl}
                    alt={style.name}
                    width={150}
                    height={100}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform"
                    data-ai-hint={style.dataAiHint}
                  />
                {selectedStyleId === style.id && (
                  <div className="absolute inset-0 bg-primary/70 flex items-center justify-center rounded-md">
                    <CheckCircle className="h-8 w-8 text-primary-foreground" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-center truncate group-hover:text-primary">{style.name}</h3>
              <p className="text-xs text-muted-foreground text-center truncate hidden sm:block">{style.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
