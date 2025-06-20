
'use client';

import Image from 'next/image';
import type { VisualStyle } from '@/lib/types';
import { visualStyles } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualStyleSelectorProps {
  selectedStyleId?: string;
  onSelectStyle: (styleId: string) => void;
}

export function VisualStyleSelector({ selectedStyleId, onSelectStyle }: VisualStyleSelectorProps) {
  return (
    <div className="space-y-4"> {/* Replaced Card with div for direct content */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {visualStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              aria-pressed={selectedStyleId === style.id}
              className={cn(
                "relative group rounded-lg border-2 p-1.5 focus:outline-none transition-all duration-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-card",
                selectedStyleId === style.id ? "border-primary shadow-2xl scale-105 ring-2 ring-primary ring-offset-background ring-offset-2" : "border-border hover:border-primary/50"
              )}
              role="radio"
              aria-checked={selectedStyleId === style.id}
              tabIndex={0} // Ensure it's focusable
              aria-label={`Select visual style: ${style.name}`}
            >
              <div className="aspect-video w-full overflow-hidden rounded-md mb-2 relative bg-muted/50">
                 <Image
                    src={style.previewImageUrl}
                    alt={style.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 15vw" // Adjusted sizes
                    className="object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out"
                    data-ai-hint={style.dataAiHint}
                  />
                {selectedStyleId === style.id && (
                  <div className="absolute inset-0 bg-primary/80 flex items-center justify-center rounded-md backdrop-blur-sm">
                    <CheckCircle className="h-10 w-10 text-primary-foreground opacity-90" />
                  </div>
                )}
                 <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm group-hover:opacity-0 transition-opacity">
                    Preview
                </div>
              </div>
              <h3 className="text-sm font-semibold text-center truncate group-hover:text-primary">{style.name}</h3>
              <p className="text-xs text-muted-foreground text-center truncate mt-0.5 hidden sm:block">{style.description}</p>
            </button>
          ))}
        </div>
    </div>
  );
}
