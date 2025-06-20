import { db } from './firebase-config';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import type { Project, ProjectData } from './types';

const PROJECTS_COLLECTION = 'projects';

// Helper to convert Firestore Timestamps to ISO strings
const convertTimestamps = (docData: any): any => {
    const data = { ...docData };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return data;
};

export async function createProjectInFirestore(projectData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, userId: string): Promise<string> {
  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
    ...projectData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getProjectsForUser(userId: string): Promise<Project[]> {
  const q = query(collection(db, PROJECTS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const projects: Project[] = [];
  querySnapshot.forEach((doc) => {
    projects.push({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    } as Project);
  });
  return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getProjectFromFirestore(projectId: string): Promise<Project | null> {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Project;
  } else {
    return null;
  }
}

export async function updateProjectInFirestore(projectId: string, updates: Partial<ProjectData>): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
  });
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await deleteDoc(docRef);
}
