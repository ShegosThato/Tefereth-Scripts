
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/types';
import { Eye, Trash2, CalendarDays, CheckCircle, ListChecks, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const getProjectStatus = () => {
    if (project.videoUrl) return { text: "Video Ready", icon: <CheckCircle className="h-4 w-4 mr-1.5 text-green-500 dark:text-green-400" />, variant: "default", className: "bg-green-500/10 text-green-700 dark:bg-green-700/20 dark:text-green-300 border-green-500/30" };
    if (project.generatedScenes && project.generatedScenes.length > 0) return { text: "Scenes Generated", icon: <ListChecks className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />, variant: "secondary", className: "bg-blue-500/10 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300 border-blue-500/30" };
    if (project.storyboard && project.storyboard.length > 0) return { text: "Storyboarded", icon: <ListChecks className="h-4 w-4 mr-1.5 text-purple-500 dark:text-purple-400" />, variant: "outline", className: "bg-purple-500/10 text-purple-700 dark:bg-purple-700/20 dark:text-purple-300 border-purple-500/30"};
    if (project.analysis) return { text: "Analyzed", icon: <CheckCircle className="h-4 w-4 mr-1.5 text-teal-500 dark:text-teal-400" />, variant: "outline", className: "bg-teal-500/10 text-teal-700 dark:bg-teal-700/20 dark:text-teal-300 border-teal-500/30"};
    return { text: "Draft", icon: <Loader2 className="h-4 w-4 mr-1.5 text-muted-foreground animate-spin" />, variant: "outline", className: "text-muted-foreground border-dashed" };
  };
  
  const status = getProjectStatus();
  const coverImage = project.generatedScenes?.[0]?.imageUrl || "https://placehold.co/600x375.png";
  const coverImageHint = project.generatedScenes?.[0]?.imageUrl ? "scene visual" : "abstract project";

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out bg-card border-border group transform hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/project/${project.id}`} aria-label={`View project: ${project.title}`} className="block">
          <div className="aspect-[16/10] w-full overflow-hidden bg-muted/50">
            <Image
              src={coverImage}
              alt={`Cover image for ${project.title}`}
              width={600}
              height={375} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
              data-ai-hint={coverImageHint}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-5 flex-grow flex flex-col">
        <Link href={`/project/${project.id}`} className="block mb-2">
          <CardTitle className="text-lg font-headline font-semibold hover:text-primary transition-colors duration-200 line-clamp-2" title={project.title}>
            {project.title}
          </CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-grow" title={project.storyText}>
          {project.storyText || "No story text provided."}
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground mt-auto mb-3">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </div>
        <Badge variant={status.variant as any} className={cn("py-1 px-2.5 text-xs self-start font-medium", status.className)}>
          {status.icon}
          {status.text}
        </Badge>
      </CardContent>
      <CardFooter className="p-4 border-t bg-card/70 flex justify-between items-center">
        <Button variant="default" size="sm" asChild className="flex-grow mr-2">
          <Link href={`/project/${project.id}`}>
            <Eye className="mr-2 h-4 w-4" /> View Project
          </Link>
        </Button>
        <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors duration-200" 
            onClick={onDelete} 
            aria-label={`Delete project: ${project.title}`}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
