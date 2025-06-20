
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/app/ProjectCard';
import { ProjectCardSkeleton } from '@/components/app/ProjectCardSkeleton';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/types';
import { useProjectStore } from '@/stores/project-store';
import { useAuth } from '@clerk/nextjs';
import { Film, LibraryBig, PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LibraryPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { projects, isLoading, error, fetchAllProjects, deleteProject } = useProjectStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      fetchAllProjects(userId);
    }
  }, [isLoaded, isSignedIn, userId, fetchAllProjects]);

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      const title = projectToDelete.title;
      await deleteProject(projectToDelete.id);
      toast({ title: 'Project Deleted', description: `"${title}" has been removed.` });
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.storyText && project.storyText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderContent = () => {
    if (!isLoaded || isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="py-10 text-center text-destructive">{error}</div>;
    }

    if (filteredProjects.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={() => handleDeleteProject(project)} />
          ))}
        </div>
      );
    }

    return (
      <div className="p-8 py-16 text-center border rounded-lg bg-card/50 border-border/50 shadow-inner">
        <Film className="w-24 h-24 mx-auto mb-8 text-muted-foreground/30 animate-pulse" />
        <h2 className="mb-3 text-2xl font-semibold text-foreground">{searchTerm ? 'No Projects Match Your Search' : 'Your Library is Empty'}</h2>
        <p className="max-w-md mx-auto mb-8 text-muted-foreground">{searchTerm ? 'Try different keywords or clear your search.' : 'Start by creating a new story video. Let your imagination spark!'}</p>
        <Button asChild size="lg" className="px-6 py-3 text-base shadow-md hover:shadow-lg">
          <Link href="/">
            <PlusCircle className="w-5 h-5 mr-2" /> Start Your First Project
          </Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-col items-center justify-between gap-4 pb-6 border-b sm:flex-row border-border/70">
        <h1 className="flex items-center text-3xl font-bold text-foreground lg:text-4xl font-headline">
          <LibraryBig className="w-10 h-10 mr-3 text-primary" />
          My Project Library
        </h1>
        <Button asChild size="lg" className="px-6 py-3 text-base shadow-md hover:shadow-lg">
          <Link href="/">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Project
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="search"
          placeholder="Search by title or story content..."
          className="w-full h-12 py-3 pl-12 pr-4 text-base shadow-sm sm:w-2/3 lg:w-1/2 focus:shadow-md group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search projects"
        />
      </div>

      {renderContent()}

      {projectToDelete && (
        <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project: "{projectToDelete.title}"?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. All data associated with this project will be permanently removed from the database.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
