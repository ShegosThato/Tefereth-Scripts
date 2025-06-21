
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
  error: { message: string; code?: string } | null;
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
        set({ error: { message: "User not authenticated." }, isLoading: false, projects: [] });
        return;
    }
    set({ isLoading: true, error: null });
    try {
      const projects = await getProjectsForUser(userId);
      set({ projects, isLoading: false });
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      set({ error: { message: err.message || 'Failed to fetch projects.' }, isLoading: false });
    }
  },

  fetchProject: async (projectId, userId) => {
    set({ isLoading: true, error: null, currentProject: null });
    if (!userId) {
        set({ error: { message: "User not authenticated." }, isLoading: false });
        return;
    }
    try {
      const project = await getProjectFromFirestore(projectId);
      // Security check: ensure the fetched project belongs to the current user.
      if (project && project.userId === userId) {
          set({ currentProject: project, isLoading: false });
      } else if (project && project.userId !== userId) {
          set({ error: { message: "Access denied. You do not own this project.", code: "PERMISSION_DENIED" }, isLoading: false });
          // Optionally, clear currentProject if it was somehow set
          // set({ currentProject: null, isLoading: false });
      }
      else {
           set({ error: { message: "Project not found.", code: "NOT_FOUND" }, isLoading: false });
      }
    } catch (err: any) {
      console.error(`Error fetching project ${projectId}:`, err);
      // Check if the error from getProjectFromFirestore or the conditions above already set a specific error
      if (!get().error) { // only set a generic error if a specific one wasn't set above
        set({ error: { message: err.message || 'Failed to fetch project.' }, isLoading: false });
      }
    }
  },

  addProject: async (projectData, userId) => {
    if (!userId) {
        set({ error: { message: "User not authenticated." } });
        return null;
    }
    set({ isLoading: true, error: null });
    try {
      const newProjectId = await createProjectInFirestore(projectData, userId);
      // After adding, refetch all projects to ensure data consistency.
      // Consider what happens if this fetchAllProjects fails. The project is added, but list isn't updated.
      // For now, we assume it works or the error from fetchAllProjects will be set.
      await get().fetchAllProjects(userId); 
      set({ isLoading: false }); // isLoading might be reset by fetchAllProjects
      return newProjectId;
    } catch (err: any) {
      console.error("Error adding project:", err);
      set({ error: { message: err.message || 'Failed to create project.' }, isLoading: false });
      return null;
    }
  },

  updateCurrentProject: async (updates) => {
    const { currentProject: projectBeforeUpdate } = get(); // Store original project for potential rollback
    if (!projectBeforeUpdate) return;
 
    set({ isLoading: true, error: null }); // Indicate loading for the update operation
    try {
      // Optimistically update the local state
      const updatedProject = { ...projectBeforeUpdate, ...updates, updatedAt: new Date().toISOString() };
      set({ currentProject: updatedProject, projects: get().projects.map(p => p.id === updatedProject.id ? updatedProject : p) });

      await updateProjectInFirestore(projectBeforeUpdate.id, updates);
      set({ isLoading: false }); // Clear loading after successful Firestore update
    } catch (err: any) {
      console.error(`Error updating project ${projectBeforeUpdate.id}:`, err);
      set({
        error: { message: err.message || 'Failed to update project.' },
        currentProject: projectBeforeUpdate, // Rollback optimistic update
        projects: get().projects.map(p => p.id === projectBeforeUpdate.id ? projectBeforeUpdate : p), // Rollback in list
        isLoading: false
      });
    }
  },

  deleteProject: async (projectId) => {
    const currentUserId = get().currentProject?.userId || get().projects.find(p=>p.id === projectId)?.userId;
    const projectListBeforeDelete = [...get().projects];
    const currentProjectBeforeDelete = get().currentProject && get().currentProject?.id === projectId ? get().currentProject : null;


    set({ isLoading: true, error: null });
    try {
        // Optimistically remove from local state
        set(state => ({
            projects: state.projects.filter(p => p.id !== projectId),
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        }));

        await deleteProjectFromFirestore(projectId);

        // If on library page, refetch to ensure consistency.
        // If currentProject was deleted, userId might be from there.
        // If not, try to get userId from the project list if needed for fetchAllProjects.
        if(currentUserId) { // This implies we are likely on a page that needs the project list.
            await get().fetchAllProjects(currentUserId); // This will set its own loading/error states.
        }
        set({ isLoading: false }); // Ensure loading is false after successful operation and potential refetch.
    } catch (err: any) {
        console.error(`Error deleting project ${projectId}:`, err);
        set({
            error: { message: err.message || 'Failed to delete project.'},
            projects: projectListBeforeDelete, // Rollback optimistic delete
            currentProject: currentProjectBeforeDelete || get().currentProject, // Rollback current project if it was the one deleted
            isLoading: false
        });
    }
  }

}));
