
import type { AnalyzeStoryOutput } from '@/ai/flows/analyze-story';
// Assuming generateStoryboardOutput contains scene structure.
// The output of generateStoryboard flow is StoryboardSceneSchema[] which is an array of {sceneDescription, imageUri}
import type { GenerateStoryboardOutput as AIStoryboardOutput } from '@/ai/flows/generate-storyboard'; 
// The output of generateScenes flow is { scenes: SceneSchema[] } where SceneSchema is { sceneDescription, imageUrl }
import type { GenerateScenesOutput as AIGeneratedScenesOutput } from '@/ai/flows/generate-scenes';


export type StoryAnalysis = AnalyzeStoryOutput;

export interface Scene {
  sceneDescription: string;
  imageUrl?: string; // For final generated scenes, holds URL from AI (likely data URI)
  storyboardImageUri?: string; // For storyboard phase, holds data URI from AI
}

// This type represents the direct output of the AI storyboard generation flow
export type StoryboardOutput = AIStoryboardOutput; // This is StoryboardSceneSchema[]

// This type represents the `scenes` array within the output of the AI scene generation flow
export type GeneratedAIScenes = AIGeneratedScenesOutput['scenes']; // This is SceneSchema[] from generate-scenes flow

export interface Project {
  id: string;
  title: string;
  storyText: string;
  analysis?: StoryAnalysis;
  storyboard?: StoryboardOutput; // Stores the array of {sceneDescription, imageUri}
  visualStyle?: string; // ID of the selected visual style
  generatedScenes?: Scene[]; // This will store scenes after mapping from AIGeneratedScenes, fitting the common `Scene` interface. imageUrl will be populated.
  videoUrl?: string; 
  createdAt: string; 
  updatedAt: string; 
}

export interface VisualStyle {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  dataAiHint: string; 
  promptFragment: string;
}

// Added more diverse data-ai-hints
export const visualStyles: VisualStyle[] = [
  { id: 'cinematic', name: 'Cinematic', description: 'Dramatic, rich colors.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'movie film still', promptFragment: 'cinematic style, dramatic lighting, high contrast, rich colors, film grain' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'anime style art', promptFragment: 'anime style, vibrant colors, expressive characters, detailed backgrounds, cel shading' },
  { id: 'pixelart', name: 'Pixel Art', description: 'Retro 8/16-bit look.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'pixel video-game scene', promptFragment: 'pixel art style, 16-bit, retro gaming aesthetic, limited palette' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing, artistic.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'watercolor art illustration', promptFragment: 'watercolor painting style, soft edges, flowing colors, artistic, textured paper' },
  { id: 'noir', name: 'Film Noir', description: 'B&W, high contrast.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'noir detective movie', promptFragment: 'film noir style, black and white, high contrast, dramatic shadows, mysterious atmosphere, 1940s aesthetic' },
  { id: 'fantasy', name: 'Fantasy Art', description: 'Epic, detailed, magical.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'fantasy landscape painting', promptFragment: 'epic fantasy art style, detailed illustration, magical elements, rich textures, vibrant lighting' },
  { id: 'scifi', name: 'Sci-Fi Concept', description: 'Futuristic, technological.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'sci-fi concept illustration', promptFragment: 'sci-fi concept art style, futuristic technology, sleek designs, neon accents, metallic surfaces' },
  { id: 'cartoon', name: 'Modern Cartoon', description: 'Clean lines, bright.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'modern cartoon style', promptFragment: 'modern cartoon style, clean lines, bright and bold colors, expressive characters, simple backgrounds' },
];
