'use client';

import type { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Lightbulb, Workflow } from 'lucide-react';

interface AnalysisTabContentProps {
  project: Project;
}

export function AnalysisTabContent({ project }: AnalysisTabContentProps) {
  if (!project.analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Story Analysis</CardTitle>
          <CardDescription>AI analysis of your story will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analysis not yet available or failed. You might need to re-trigger it.</p>
        </CardContent>
      </Card>>
    );
  }

  const { themes, characters, structure, summary } = project.analysis;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline">
            <FileText className="mr-3 h-7 w-7 text-primary" />
            Story Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-headline">
              <Lightbulb className="mr-2 h-6 w-6 text-primary" />
              Key Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {themes.map((theme, index) => (
              <Badge key={index} variant="secondary" className="text-base px-3 py-1">{theme}</Badge>
            ))}
          </{theme}s>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-headline">
              <Users className="mr-2 h-6 w-6 text-primary" />
              Main Characters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {characters.map((character, index) => (
              <p key={index} className="text-base border-b pb-1 mb-1">{character}</p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-headline">
            <Workflow className="mr-2 h-6 w-6 text-primary" />
            Story Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed whitespace-pre-line">{structure}</p>
        </CardContent>
      </Card>
    </div>
  );
}
