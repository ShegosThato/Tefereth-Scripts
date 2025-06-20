'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject, updateProject as saveProjectDetails, type Project } from '@/lib/project-store'; // Ensure Project type is exported
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisTabContent } from '@/components/app/project/AnalysisTabContent';
import { StoryboardTabContent } from '@/components/app/project/StoryboardTabContent';
import { VideoTabContent } from '@/components/app/project/VideoTabContent';
import { LoadingSpinner } from '@/components/app/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3, Save, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProject as deleteProjectFromStore } from '@/lib/project-store';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (projectId) {
      const fetchedProject = getProject(projectId);
      if (fetchedProject) {
        setProject(fetchedProject);
        setEditableTitle(fetchedProject.title);
      } else {
        // Handle project not found, e.g., redirect to library or 404
        toast({ title: "Project Not Found", description: "The requested project could not be found.", variant: "destructive" });
        router.push('/library');
      }
      setIsLoading(false);
    }
  }, [projectId, router, toast]);

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
    // Optionally re-fetch from store if updates are complex or can happen elsewhere
    // const refreshedProject = getProject(projectId);
    // if(refreshedProject) setProject(refreshedProject);
  };
  
  const handleTitleSave = () => {
    if (project && editableTitle.trim() !== '' && editableTitle.trim() !== project.title) {
      const updatedProject = saveProjectDetails(project.id, { title: editableTitle.trim() });
      if (updatedProject) {
        setProject(updatedProject);
        toast({ title: "Title Updated", description: "Project title saved successfully." });
      }
    }
    setIsEditingTitle(false);
  };

  const handleDeleteProject = () => {
    if (project) {
        deleteProjectFromStore(project.id);
        toast({ title: "Project Deleted", description: `"${project.title}" has been removed.`});
        router.push('/library');
    }
    setShowDeleteConfirm(false);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><LoadingSpinner text="Loading project..." size={48} /></div>;
  }

  if (!project) {
    // This case should ideally be handled by the redirect in useEffect
    return <div className="text-center py-10">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" size="icon" asChild className="shrink-0">
          <Link href="/library" aria-label="Back to Library">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-grow min-w-0">
        {isEditingTitle ? (
          <div className="flex gap-2 items-center">
            <Input 
              value={editableTitle} 
              onChange={(e) => setEditableTitle(e.target.value)} 
              className="text-2xl font-bold font-headline h-10"
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            />
            <Button onClick={handleTitleSave} size="icon" aria-label="Save title">
                <Save className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 items-center cursor-pointer group" onClick={() => setIsEditingTitle(true)} title="Edit title">
            <h1 className="text-3xl font-bold font-headline truncate" title={project.title}>
              {project.title}
            </h1>
            <Edit3 className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        </div>
        <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            {/* Share button can be added here if needed */}
        </div>
      </div>
      
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:max-w-md mx-auto">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="storyboard" disabled={!project.analysis}>Storyboard & Scenes</TabsTrigger>
          <TabsTrigger value="video" disabled={!(project.generatedScenes && project.generatedScenes.length > 0)}>Video</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis" className="mt-6">
          <AnalysisTabContent project={project} />
        </TabsContent>
        <TabsContent value="storyboard" className="mt-6">
          {project.analysis ? (
            <StoryboardTabContent project={project} onProjectUpdate={handleProjectUpdate} />
          ) : (
            <p className="text-muted-foreground text-center py-8">Please complete story analysis first to access storyboard features.</p>
          )}
        </TabsContent>
        <TabsContent value="video" className="mt-6">
           {(project.generatedScenes && project.generatedScenes.length > 0) ? (
            <VideoTabContent project={project} />
           ) : (
            <p className="text-muted-foreground text-center py-8">Please generate scenes first to access video features.</p>
           )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the project "{project.title}". This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
