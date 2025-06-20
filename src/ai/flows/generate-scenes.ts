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

const generateScenePrompt = ai.definePrompt({
  name: 'generateScenePrompt',
  input: {schema: z.object({sceneDescription: z.string(), visualStyle: z.string()})},
  output: {schema: SceneSchema},
  prompt: `You are an AI video creator who creates scenes for a video based on the storyboard.

  Based on the scene description and visual style, create a unique image for the scene.

  Scene Description: {{{sceneDescription}}}
  Visual Style: {{{visualStyle}}}

  Ensure the image is consistent with the visual style.
  Return the URL of the generated image and scene description in the correct JSON format.`,
});

const generateScenesFlow = ai.defineFlow(
  {
    name: 'generateScenesFlow',
    inputSchema: GenerateScenesInputSchema,
    outputSchema: GenerateScenesOutputSchema,
  },
  async input => {
    const sceneDescriptions = input.storyboardDescription.split('\n');
    const scenes: SceneSchema[] = [];

    for (const sceneDescription of sceneDescriptions) {
      if (sceneDescription.trim() === '') {
        continue;
      }

      const {output} = await generateScenePrompt({
        sceneDescription: sceneDescription,
        visualStyle: input.visualStyle,
      });

      if (output) {
        // Generate image for the scene using Gemini 2.0 Flash experimental image generation
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp',
          prompt: [
            {text: `Generate an image of: ${sceneDescription}`},
            {text: `In the style of: ${input.visualStyle}`},
          ],
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        if (media?.url) {
          scenes.push({
            sceneDescription: sceneDescription,
            imageUrl: media.url,
          });
        }
      }
    }

    return {scenes: scenes};
  }
);
