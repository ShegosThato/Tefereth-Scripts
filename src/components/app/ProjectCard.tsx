import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/types';
import { Eye, Edit3, Trash2, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const getProjectStatus = () => {
    if (project.videoUrl) return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Video Ready</Badge>;
    if (project.generatedScenes && project.generatedScenes.length > 0) return <Badge variant="secondary">Scenes Generated</Badge>;
    if (project.storyboard && project.storyboard.length > 0) return <Badge variant="outline">Storyboard Created</Badge>;
    if (project.analysis) return <Badge variant="outline">Analyzed</Badge>;
    return <Badge variant="outline">Draft</Badge>;
  };
  
  const coverImage = project.generatedScenes?.[0]?.imageUrl || project.storyboard?.[0]?.imageUri || "https://placehold.co/600x400.png";

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <Link href={`/project/${project.id}`} aria-label={`View project: ${project.title}`}>
          <div className="aspect-video w-full overflow-hidden">
            <Image
              src={coverImage}
              alt={`Cover image for ${project.title}`}
              width={600}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              data-ai-hint="abstract animation"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/project/${project.id}`}>
          <CardTitle className="text-xl font-headline mb-1 hover:text-primary transition-colors">{project.title}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2" title={project.storyText}>
          {project.storyText}
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
          Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </div>
        {getProjectStatus()}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <Button variant="default" size="sm" asChild>
          <Link href={`/project/${project.id}`}>
            <Eye className="mr-2 h-4 w-4" /> View
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(project.id)} aria-label={`Delete project: ${project.title}`}>
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
