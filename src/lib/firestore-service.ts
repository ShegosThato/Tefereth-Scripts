
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
  orderBy,
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
  if (!db) throw new Error("Firestore is not initialized. Check your Firebase config.");
  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
    ...projectData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getProjectsForUser(userId: string): Promise<Project[]> {
  if (!db) return []; // Return empty array if firestore is not available
  const q = query(
    collection(db, PROJECTS_COLLECTION), 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc') // Sorting is now done by Firestore
  );
  const querySnapshot = await getDocs(q);
  const projects: Project[] = [];
  querySnapshot.forEach((doc) => {
    projects.push({
      id: doc.id,
      ...convertTimestamps(doc.data()),
    } as Project);
  });
  return projects;
}

export async function getProjectFromFirestore(projectId: string): Promise<Project | null> {
  if (!db) throw new Error("Firestore is not initialized. Check your Firebase config.");
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps(docSnap.data()) } as Project;
  } else {
    return null;
  }
}

export async function updateProjectInFirestore(projectId: string, updates: Partial<ProjectData>): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized. Check your Firebase config.");
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
  });
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  if (!db) throw new Error("Firestore is not initialized. Check your Firebase config.");
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await deleteDoc(docRef);
}
