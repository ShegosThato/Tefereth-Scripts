'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProjects, deleteProject as deleteProjectFromStore } from '@/lib/project-store';
import type { Project } from '@/lib/types';
import { ProjectCard } from '@/components/app/ProjectCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, LibraryBig, Search } from 'lucide-react';
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
  AlertDialogTrigger,
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

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToDelete(project);
    }
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProjectFromStore(projectToDelete.id);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      toast({ title: "Project Deleted", description: `"${projectToDelete.title}" has been removed.`});
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <LibraryBig className="mr-3 h-8 w-8 text-primary" />
          My Project Library
        </h1>
        <Button asChild size="lg">
          <Link href="/">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search projects..."
          className="pl-10 w-full sm:w-1/2 lg:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} onDelete={() => handleDeleteProject(project.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <LibraryBig className="mx-auto h-24 w-24 text-muted-foreground/50 mb-6" />
          <h2 className="text-2xl font-semibold mb-2">No Projects Found</h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? "No projects match your search." : "You haven't created any projects yet."}
          </p>
          <Button asChild>
            <Link href="/">
              <PlusCircle className="mr-2 h-4 w-4" /> Start Your First Project
            </Link>
          </Button>
        </div>
      )}

      {projectToDelete && (
         <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project "{projectToDelete.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
