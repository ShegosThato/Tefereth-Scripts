
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProjects, deleteProject as deleteProjectFromStore } from '@/lib/project-store';
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

export default function LibraryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setProjects(getAllProjects());
  }, []);

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProjectFromStore(projectToDelete.id);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
      toast({ title: "Project Deleted", description: `"${projectToDelete.title}" has been removed.`});
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.storyText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-6">
        <h1 className="text-3xl lg:text-4xl font-headline font-bold flex items-center">
          <LibraryBig className="mr-3 h-10 w-10 text-primary" />
          My Project Library
        </h1>
        <Button asChild size="lg" className="px-6 py-3 text-base">
          <Link href="/">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Project
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title or story content..."
          className="pl-12 pr-4 py-3 h-12 text-base w-full sm:w-2/3 lg:w-1/2 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search projects"
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} onDelete={() => handleDeleteProject(project)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Film className="mx-auto h-24 w-24 text-muted-foreground/30 mb-8" />
          <h2 className="text-2xl font-semibold mb-3">
            {searchTerm ? "No Projects Match Your Search" : "Your Library is Empty"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {searchTerm ? "Try different keywords or clear your search." : "Start by creating a new story video. Let your imagination spark!"}
          </p>
          <Button asChild size="lg" className="text-base px-6 py-3">
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
                This action cannot be undone. All data associated with this project will be permanently removed.
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
