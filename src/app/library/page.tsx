
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/stores/project-store';
import type { Project } from '@/lib/types';
import { ProjectCard } from '@/components/app/ProjectCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, LibraryBig, Search, Film } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/app/LoadingSpinner';
import { useAuth } from '@clerk/nextjs';

export default function LibraryPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { projects, isLoading, error, fetchAllProjects, deleteProject } = useProjectStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchAllProjects();
    }
  }, [isLoaded, isSignedIn, fetchAllProjects]);

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      const title = projectToDelete.title;
      await deleteProject(projectToDelete.id);
      toast({ title: "Project Deleted", description: `"${title}" has been removed.`});
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.storyText && project.storyText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isLoaded || isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><LoadingSpinner text="Loading your projects..." size={48} /></div>;
  }

  if (error) {
     return <div className="text-center py-10 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-6 border-border/70">
        <h1 className="text-3xl lg:text-4xl font-headline font-bold flex items-center text-foreground">
          <LibraryBig className="mr-3 h-10 w-10 text-primary" />
          My Project Library
        </h1>
        <Button asChild size="lg" className="px-6 py-3 text-base shadow-md hover:shadow-lg">
          <Link href="/">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Project
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="search"
          placeholder="Search by title or story content..."
          className="pl-12 pr-4 py-3 h-12 text-base w-full sm:w-2/3 lg:w-1/2 shadow-sm focus:shadow-md group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search projects"
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} onDelete={() => handleDeleteProject(project)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card/50 p-8 rounded-lg shadow-inner border border-border/50">
          <Film className="mx-auto h-24 w-24 text-muted-foreground/30 mb-8 animate-pulse" />
          <h2 className="text-2xl font-semibold mb-3 text-foreground">
            {searchTerm ? "No Projects Match Your Search" : "Your Library is Empty"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {searchTerm ? "Try different keywords or clear your search." : "Start by creating a new story video. Let your imagination spark!"}
          </p>
          <Button asChild size="lg" className="text-base px-6 py-3 shadow-md hover:shadow-lg">
            <Link href="/">
              <PlusCircle className="mr-2 h-5 w-5" /> Start Your First Project
            </Link>
          </Button>
        </div>
      )}

      {projectToDelete && (
         <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project: "{projectToDelete.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All data associated with this project will be permanently removed from the database.
              </AlertDialogDescription>
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
