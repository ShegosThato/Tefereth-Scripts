
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/project-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisTabContent } from '@/components/app/project/AnalysisTabContent';
import { StoryboardTabContent } from '@/components/app/project/StoryboardTabContent';
import { VideoTabContent } from '@/components/app/project/VideoTabContent';
import { LoadingSpinner } from '@/components/app/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit3, Save, Share2, Trash2, Check, X } from 'lucide-react';
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
import { useAuth } from '@clerk/nextjs';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isLoaded, isSignedIn } = useAuth();
  const projectId = params.projectId as string;

  const {
    currentProject: project,
    isLoading,
    error,
    fetchProject,
    updateCurrentProject,
    deleteProject,
  } = useProjectStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && projectId) {
      fetchProject(projectId);
    }
  }, [projectId, isLoaded, isSignedIn, fetchProject]);
  
  useEffect(() => {
    if (project) {
        setEditableTitle(project.title);
    }
  }, [project]);

  const handleTitleSave = async () => {
    if (project && editableTitle.trim() !== '' && editableTitle.trim() !== project.title) {
      await updateCurrentProject({ title: editableTitle.trim() });
      toast({ title: "Title Updated", description: "Project title saved successfully." });
    }
    setIsEditingTitle(false);
  };

  const handleDeleteProject = async () => {
    if (project) {
        await deleteProject(project.id);
        toast({ title: "Project Deleted", description: `"${project.title}" has been removed.`});
        router.push('/library');
    }
    setShowDeleteConfirm(false);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><LoadingSpinner text="Loading project details..." size={48} /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">{error}</div>;
  }

  if (!project) {
    return <div className="text-center py-10 text-muted-foreground">Project data could not be loaded. It might not exist or you may not have permission to view it. <Link href="/library" className="text-primary hover:underline">Return to Library</Link></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/70">
        <div className="flex items-center gap-3 flex-grow min-w-0">
            <Button variant="outline" size="icon" asChild className="shrink-0 hover:border-primary/50" aria-label="Back to Library">
              <Link href="/library">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            {isEditingTitle ? (
              <div className="flex gap-2 items-center flex-grow">
                <Input 
                  value={editableTitle} 
                  onChange={(e) => setEditableTitle(e.target.value)} 
                  className="text-2xl font-bold font-headline h-11 flex-grow shadow-sm focus:shadow-md"
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') {
                        setEditableTitle(project.title); 
                        setIsEditingTitle(false);
                      }
                  }}
                  onBlur={() => { 
                    if (editableTitle.trim() !== '' && editableTitle.trim() !== project.title) {
                        handleTitleSave();
                    } else {
                        setEditableTitle(project.title); 
                        setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  aria-label="Edit project title"
                />
                <Button onClick={handleTitleSave} size="icon" variant="ghost" className="text-green-600 hover:text-green-500 hover:bg-green-500/10 dark:hover:bg-green-700/20 shrink-0" aria-label="Save title">
                    <Check className="h-5 w-5" />
                </Button>
                 <Button onClick={() => { setEditableTitle(project.title); setIsEditingTitle(false); }} size="icon" variant="ghost" className="text-red-600 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-700/20 shrink-0" aria-label="Cancel title edit">
                    <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 items-center cursor-pointer group flex-grow min-w-0" onClick={() => setIsEditingTitle(true)} title="Edit title (Click to edit)" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(true)}>
                <h1 className="text-2xl md:text-3xl font-bold font-headline truncate text-foreground" title={project.title}>
                  {project.title}
                </h1>
                <Edit3 className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-200 shrink-0" />
              </div>
            )}
        </div>
        <div className="flex gap-2 shrink-0 self-start sm:self-center">
            <Button variant="destructive_outline" onClick={() => setShowDeleteConfirm(true)} >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Project
            </Button>
        </div>
      </div>
      
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 md:max-w-lg mx-auto h-auto sm:h-12 text-base p-1.5">
          <TabsTrigger value="analysis" className="py-2.5">Analysis</TabsTrigger>
          <TabsTrigger value="storyboard" disabled={!project.analysis} className="py-2.5">Storyboard & Scenes</TabsTrigger>
          <TabsTrigger value="video" disabled={!(project.generatedScenes && project.generatedScenes.length > 0)} className="py-2.5">Video</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis" className="mt-8 animate-in fade-in-50 duration-300">
          <AnalysisTabContent project={project} />
        </TabsContent>
        <TabsContent value="storyboard" className="mt-8 animate-in fade-in-50 duration-300">
          {project.analysis ? (
            <StoryboardTabContent />
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card/80 p-8 rounded-lg shadow-inner border border-border/50">
                <p className="text-lg">Please complete story analysis first to unlock storyboard and scene generation features.</p>
                <p className="mt-2 text-sm">The AI needs to understand your story before it can visualize it.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="video" className="mt-8 animate-in fade-in-50 duration-300">
           {(project.generatedScenes && project.generatedScenes.length > 0) ? (
            <VideoTabContent />
           ) : (
             <div className="text-center py-12 text-muted-foreground bg-card/80 p-8 rounded-lg shadow-inner border border-border/50">
                <p className="text-lg">Generate visual scenes first to assemble your video.</p>
                <p className="mt-2 text-sm">Once scenes are ready, you can compile them into the final video here.</p>
            </div>
           )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete the project "{project.title}"? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Yes, Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
