
'use client'; // Required for localStorage access

import type { Project } from './types';

const PROJECTS_STORAGE_KEY = 'teferethScriptsProjects';

function getProjectsFromStorage(): Project[] {
  if (typeof window === 'undefined') return [];
  const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
  return storedProjects ? JSON.parse(storedProjects) : [];
}

function saveProjectsToStorage(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(title: string, storyText: string): Project {
  const projects = getProjectsFromStorage();
  const newProject: Project = {
    id: crypto.randomUUID(),
    title,
    storyText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveProjectsToStorage([...projects, newProject]);
  return newProject;
}

export function getProject(id: string): Project | null {
  const projects = getProjectsFromStorage();
  return projects.find(p => p.id === id) || null;
}

export function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | null {
  let projects = getProjectsFromStorage();
  let updatedProject: Project | null = null;
  projects = projects.map(p => {
    if (p.id === id) {
      updatedProject = { ...p, ...updates, updatedAt: new Date().toISOString() };
      return updatedProject;
    }
    return p;
  });
  if (updatedProject) {
    saveProjectsToStorage(projects);
  }
  return updatedProject;
}

export function getAllProjects(): Project[] {
  return getProjectsFromStorage().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function deleteProject(id: string): boolean {
  let projects = getProjectsFromStorage();
  const initialLength = projects.length;
  projects = projects.filter(p => p.id !== id);
  if (projects.length < initialLength) {
    saveProjectsToStorage(projects);
    return true;
  }
  return false;
}
