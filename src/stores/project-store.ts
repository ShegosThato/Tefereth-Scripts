
import { create } from 'zustand';
import {
  createProjectInFirestore,
  getProjectsForUser,
  getProjectFromFirestore,
  updateProjectInFirestore,
  deleteProjectFromFirestore,
} from '@/lib/firestore-service';
import type { Project, ProjectData } from '@/lib/types';
import { getAuth } from '@clerk/nextjs/server';
import { useAuth } from '@clerk/nextjs';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  fetchAllProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  addProject: (projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  updateCurrentProject: (updates: Partial<ProjectData>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

const getCurrentUserId = () => {
    // This is a bit of a workaround to get the user ID in a client-side store.
    // We rely on the `useAuth` hook in the components to provide the user context.
    // A more robust solution might involve passing userId to every store action.
    // For this app's scale, we'll get it from the clerk singleton when needed.
    const { userId } = useAuth.getState();
    return userId;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  setLoading: (isLoading) => set({ isLoading }),

  fetchAllProjects: async () => {
    const userId = getCurrentUserId();
    if (!userId) {
        set({ error: "User not authenticated." });
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

  fetchProject: async (projectId) => {
    set({ isLoading: true, error: null, currentProject: null });
    try {
      const project = await getProjectFromFirestore(projectId);
       const userId = getCurrentUserId();
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

  addProject: async (projectData) => {
    const userId = getCurrentUserId();
    if (!userId) {
        set({ error: "User not authenticated." });
        return null;
    }
    set({ isLoading: true, error: null });
    try {
      const newProjectId = await createProjectInFirestore(projectData, userId);
      // After adding, we could either refetch all or just add to the local state.
      // Refetching is simpler and ensures data consistency.
      await get().fetchAllProjects(); 
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

    set({ isLoading: true, error: null });
    try {
      await updateProjectInFirestore(currentProject.id, updates);
      // Optimistically update the local state
      const updatedProject = { ...currentProject, ...updates, updatedAt: new Date().toISOString() };
      set({ currentProject: updatedProject, isLoading: false });

      // also update the project in the main list
      set(state => ({
          projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
      }))

    } catch (err) {
      console.error(`Error updating project ${currentProject.id}:`, err);
      set({ error: 'Failed to update project.', isLoading: false });
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
        await deleteProjectFromFirestore(projectId);
        set(state => ({
            projects: state.projects.filter(p => p.id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            isLoading: false
        }));
    } catch (err) {
        console.error(`Error deleting project ${projectId}:`, err);
        set({ error: 'Failed to delete project.', isLoading: false });
    }
  }

}));
