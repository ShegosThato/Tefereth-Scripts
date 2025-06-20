
'use client';

import type { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Lightbulb, Workflow, AlertCircle } from 'lucide-react';

interface AnalysisTabContentProps {
  project: Project;
}

export function AnalysisTabContent({ project }: AnalysisTabContentProps) {
  if (!project.analysis) {
    return (
      <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline">
            <AlertCircle className="mr-3 h-7 w-7 text-destructive animate-pulse" />
            Story Analysis Not Available
          </CardTitle>
          <CardDescription>The AI analysis of your story could not be loaded or has not been performed yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If you've just created this project, the analysis might still be in progress. 
            If this persists, you may need to try re-analyzing the story or checking the input.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { themes, characters, structure, summary } = project.analysis;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline">
            <FileText className="mr-3 h-7 w-7 text-primary" />
            AI Story Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{summary || "No summary provided."}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-headline">
              <Lightbulb className="mr-2 h-6 w-6 text-primary" />
              Key Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {themes && themes.length > 0 ? themes.map((theme, index) => (
              <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5 bg-secondary/80 hover:bg-secondary transition-colors duration-150 ease-in-out shadow-sm">
                {theme}
              </Badge>
            )) : <p className="text-sm text-muted-foreground">No themes identified.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-headline">
              <Users className="mr-2 h-6 w-6 text-primary" />
              Main Characters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {characters && characters.length > 0 ? characters.map((character, index) => (
              <p key={index} className="text-base border-b border-border/50 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">{character}</p>
            )) : <p className="text-sm text-muted-foreground">No main characters identified.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-border/70 transform transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <Workflow className="mr-2 h-6 w-6 text-primary" />
            Story Structure Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{structure || "No structure analysis provided."}</p>
        </CardContent>
      </Card>
    </div>
  );
}
