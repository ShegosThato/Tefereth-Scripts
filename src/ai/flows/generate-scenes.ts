'use server';

/**
 * @fileOverview Generates unique images and short video clips for each scene in a storyboard based on descriptions.
 *
 * - generateScenes - A function that generates scenes for a storyboard.
 * - GenerateScenesInput - The input type for the generateScenes function.
 * - GenerateScenesOutput - The return type for the generateScenes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScenesInputSchema = z.object({
  storyboardDescription: z
    .string()
    .describe('The description of the storyboard, including scene descriptions.'),
  visualStyle: z.string().describe('The desired visual style for the scenes.'),
});
export type GenerateScenesInput = z.infer<typeof GenerateScenesInputSchema>;

const SceneSchema = z.object({
  sceneDescription: z.string().describe('Description of the scene.'),
  imageUrl: z.string().describe('URL of the generated image for the scene.'),
});

const GenerateScenesOutputSchema = z.object({
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
  async input => {
    const sceneDescriptions = input.storyboardDescription
      .split('\n')
      .map(desc => desc.trim())
      .filter(desc => desc !== '');

    const scenePromises = sceneDescriptions.map(async sceneDescription => {
      try {
        // Generate image for the scene in parallel
        const {media} = await ai.generate({
          // IMPORTANT: Use the correct model for image generation.
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: `${sceneDescription}, in the style of ${input.visualStyle}`,
          config: {
            // IMPORTANT: Both TEXT and IMAGE are required for this model.
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
      // Return null for failed generations so Promise.all doesn't reject early
      return null;
    });

    const generatedScenes = await Promise.all(scenePromises);

    // Filter out any null results from failed generations
    const successfulScenes = generatedScenes.filter((scene): scene is z.infer<typeof SceneSchema> => scene !== null);

    return {scenes: successfulScenes};
  }
);
