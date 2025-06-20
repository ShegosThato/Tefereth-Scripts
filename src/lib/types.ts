
import type { AnalyzeStoryOutput } from '@/ai/flows/analyze-story';
import type { GenerateStoryboardOutput as AIStoryboardOutput } from '@/ai/flows/generate-storyboard'; 
import type { GenerateScenesOutput as AIGeneratedScenesOutput } from '@/ai/flows/generate-scenes';


export type StoryAnalysis = AnalyzeStoryOutput;

export interface Scene {
  sceneDescription: string;
  imageUrl?: string;
  storyboardImageUri?: string;
}

export type StoryboardScene = {
  sceneDescription: string;
  imageUri: string;
};

export type StoryboardOutput = StoryboardScene[];

export type GeneratedAIScenes = AIGeneratedScenesOutput['scenes'];

// This is the shape of the data stored in Firestore
export interface ProjectData {
  id: string;
  userId: string;
  title: string;
  storyText: string;
  analysis?: StoryAnalysis;
  storyboard?: StoryboardOutput;
  visualStyle?: string;
  generatedScenes?: Scene[];
  videoUrl?: string; 
  createdAt: string; 
  updatedAt: string; 
}

// This is the type used within the application, it's identical for now
export type Project = ProjectData;

export interface VisualStyle {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  dataAiHint: string; 
  promptFragment: string;
}

export const visualStyles: VisualStyle[] = [
  { id: 'cinematic', name: 'Cinematic', description: 'Dramatic, rich colors.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'movie film still', promptFragment: 'cinematic style, dramatic lighting, high contrast, rich colors, film grain' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'anime style art', promptFragment: 'anime style, vibrant colors, expressive characters, detailed backgrounds, cel shading' },
  { id: 'pixelart', name: 'Pixel Art', description: 'Retro 8/16-bit look.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'pixel video-game scene', promptFragment: 'pixel art style, 16-bit, retro gaming aesthetic, limited palette' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing, artistic.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'watercolor art illustration', promptFragment: 'watercolor painting style, soft edges, flowing colors, artistic, textured paper' },
  { id: 'noir', name: 'Film Noir', description: 'B&W, high contrast.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'noir detective movie', promptFragment: 'film noir style, black and white, high contrast, dramatic shadows, mysterious atmosphere, 1940s aesthetic' },
  { id: 'fantasy', name: 'Fantasy Art', description: 'Epic, detailed, magical.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'fantasy landscape painting', promptFragment: 'epic fantasy art style, detailed illustration, magical elements, rich textures, vibrant lighting' },
  { id: 'scifi', name: 'Sci-Fi Concept', description: 'Futuristic, technological.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'sci-fi concept illustration', promptFragment: 'sci-fi concept art style, futuristic technology, sleek designs, neon accents, metallic surfaces' },
  { id: 'cartoon', name: 'Modern Cartoon', description: 'Clean lines, bright.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'modern cartoon style', promptFragment: 'modern cartoon style, clean lines, bright and bold colors, expressive characters, simple backgrounds' },
  { id: 'claymation', name: 'Claymation', description: 'Handcrafted, stop-motion.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'claymation character scene', promptFragment: 'claymation style, stop-motion animation, handcrafted look, vibrant, tactile textures' },
  { id: '3drender', name: '3D Render', description: 'Modern animated film look.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: '3d animation movie', promptFragment: '3d render, Pixar style, high-detail, cinematic lighting, vibrant and expressive' },
  { id: 'vaporwave', name: 'Vaporwave', description: 'Retro-futuristic aesthetic.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'vaporwave aesthetic landscape', promptFragment: 'vaporwave aesthetic, neon colors, pink and teal, 80s retro-futurism, grid lines, roman statues' },
  { id: 'lineart', name: 'Line Art', description: 'Clean, minimalist.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'minimalist line art', promptFragment: 'minimalist line art, black and white, clean lines, simple shapes' },
  { id: 'ukiyo-e', name: 'Ukiyo-e', description: 'Japanese woodblock print.', previewImageUrl: 'https://placehold.co/300x180.png', dataAiHint: 'japanese ukiyo-e art', promptFragment: 'Japanese ukiyo-e woodblock print style, flowing lines, muted color palette, traditional' },
];
