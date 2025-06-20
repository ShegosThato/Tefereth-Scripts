'use server';

/**
 * @fileOverview Generates unique images for each scene description provided.
 *
 * - generateScenes - A function that generates scenes for a storyboard.
 * - GenerateScenesInput - The input type for the generateScenes function.
 * - GenerateScenesOutput - The return type for the generateScenes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Scene } from '@/lib/types';

export const GenerateScenesInputSchema = z.object({
  storyboard: z.array(z.string()).describe('An array of scene descriptions.'),
  visualStyle: z.string().describe('The desired visual style for the scenes.'),
});
export type GenerateScenesInput = z.infer<typeof GenerateScenesInputSchema>;


const SceneSchema = z.object({
  sceneDescription: z.string().describe('Description of the scene.'),
  imageUrl: z.string().describe('URL of the generated image for the scene.'),
});

export const GenerateScenesOutputSchema = z.object({
  scenes: z.array(SceneSchema).describe('Array of generated scenes.'),
});
export type GenerateScenesOutput = z.infer<typeof GenerateScenesOutputSchema>;

export async function generateScenes(input: GenerateScenesInput): Promise<GenerateScenesOutput> {
  return generateScenesFlow(input);
}

const generateScenesFlow = ai.defineFlow(
  {
    name: 'generateScenesFlow',
    inputSchema: GenerateScenesInputSchema,
    outputSchema: GenerateScenesOutputSchema,
  },
  async (input): Promise<GenerateScenesOutput> => {
    
    const scenePromises = input.storyboard.map(async (sceneDescription): Promise<Scene | null> => {
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: `${sceneDescription}, in the style of ${input.visualStyle}`,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        if (media?.url) {
          return {
            sceneDescription: sceneDescription,
            imageUrl: media.url,
          };
        }
      } catch (error) {
        console.error(`Failed to generate image for scene: "${sceneDescription}"`, error);
      }
      return null;
    });

    const generatedScenes = await Promise.all(scenePromises);
    const successfulScenes = generatedScenes.filter((scene): scene is Scene => scene !== null);

    return {scenes: successfulScenes};
  }
);
