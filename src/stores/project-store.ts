
import { create } from 'zustand';
import {
  createProjectInFirestore,
  getProjectsForUser,
  getProjectFromFirestore,
  updateProjectInFirestore,
  deleteProjectFromFirestore,
} from '@/lib/firestore-service';
import type { Project, ProjectData } from '@/lib/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  fetchAllProjects: (userId: string) => Promise<void>;
  fetchProject: (projectId: string, userId: string) => Promise<void>;
  addProject: (projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string) => Promise<string | null>;
  updateCurrentProject: (updates: Partial<ProjectData>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false, // Start with loading false. Let actions manage their own loading state.
  error: null,

  setLoading: (isLoading) => set({ isLoading }),

  fetchAllProjects: async (userId) => {
    if (!userId) {
        set({ error: "User not authenticated.", isLoading: false, projects: [] });
        return;
    }
    set({ isLoading: true, error: null });
    try {
      const projects = await getProjectsForUser(userId);
      set({ projects, isLoading: false });
    } catch (err) {
      console.error("Error fetching projects:", err);
      set({ error: 'Failed to fetch projects.', isLoading: false });
    }
  },

  fetchProject: async (projectId, userId) => {
    set({ isLoading: true, error: null, currentProject: null });
    if (!userId) {
        set({ error: "User not authenticated.", isLoading: false });
        return;
    }
    try {
      const project = await getProjectFromFirestore(projectId);
      // Security check: ensure the fetched project belongs to the current user.
      if (project && project.userId === userId) {
          set({ currentProject: project, isLoading: false });
      } else {
           throw new Error("Project not found or access denied.");
      }
    } catch (err) {
      console.error(`Error fetching project ${projectId}:`, err);
      set({ error: 'Failed to fetch project.', isLoading: false });
    }
  },

  addProject: async (projectData, userId) => {
    if (!userId) {
        set({ error: "User not authenticated." });
        return null;
    }
    set({ isLoading: true, error: null });
    try {
      const newProjectId = await createProjectInFirestore(projectData, userId);
      // After adding, refetch all projects to ensure data consistency.
      await get().fetchAllProjects(userId); 
      set({ isLoading: false });
      return newProjectId;
    } catch (err) {
      console.error("Error adding project:", err);
      set({ error: 'Failed to create project.', isLoading: false });
      return null;
    }
  },

  updateCurrentProject: async (updates) => {
    const { currentProject } = get();
    if (!currentProject) return;
 
    try {
      // Optimistically update the local state
      const updatedProject = { ...currentProject, ...updates, updatedAt: new Date().toISOString() };
      set({ currentProject: updatedProject });

      // also update the project in the main list
      set(state => ({
          projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
      }));

      // Await the firestore update in the background
      await updateProjectInFirestore(currentProject.id, updates);

    } catch (err) {
      console.error(`Error updating project ${currentProject.id}:`, err);
      set({ error: 'Failed to update project.'});
       // Revert the optimistic update on error
      set({ currentProject });
    }
  },

  deleteProject: async (projectId) => {
    const currentUserId = get().currentProject?.userId;
    set({ isLoading: true, error: null });
    try {
        await deleteProjectFromFirestore(projectId);
        // Optimistically remove from local state
        set(state => ({
            projects: state.projects.filter(p => p.id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        }));
        // Refetch to ensure consistency, especially if on library page
        if(currentUserId) {
            await get().fetchAllProjects(currentUserId);
        }
    } catch (err) {
        console.error(`Error deleting project ${projectId}:`, err);
        set({ error: 'Failed to delete project.'});
    } finally {
        set({ isLoading: false });
    }
  }

}));
