// Use server directive is required for Genkit flows.
'use server';

/**
 * @fileOverview Generates a visual storyboard based on key story elements and user prompts.
 *
 * - generateStoryboard - A function to generate a storyboard.
 * - GenerateStoryboardInput - Input type for generateStoryboard.
 * - GenerateStoryboardOutput - Output type for generateStoryboard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryboardInputSchema = z.object({
  storyAnalysis: z.string().describe('The AI analysis of the story, including key themes, characters, and structural elements.'),
  userPrompts: z.string().describe('User-provided textual prompts to guide the storyboard generation.'),
});
export type GenerateStoryboardInput = z.infer<typeof GenerateStoryboardInputSchema>;

const StoryboardSceneSchema = z.object({
  sceneDescription: z.string().describe('A textual description of the scene.'),
  imageUri: z.string().describe('A data URI containing the generated image for the scene.'),
});

const GenerateStoryboardOutputSchema = z.array(StoryboardSceneSchema).describe('An array of storyboard scenes, each with a description and image.');
export type GenerateStoryboardOutput = z.infer<typeof GenerateStoryboardOutputSchema>;

export async function generateStoryboard(input: GenerateStoryboardInput): Promise<GenerateStoryboardOutput> {
  return generateStoryboardFlow(input);
}

const generateStoryboardPrompt = ai.definePrompt({
  name: 'generateStoryboardPrompt',
  input: {schema: GenerateStoryboardInputSchema},
  output: {schema: GenerateStoryboardOutputSchema},
  prompt: `Based on the story analysis and user prompts, create a visual storyboard.

Story Analysis: {{{storyAnalysis}}}
User Prompts: {{{userPrompts}}}

Generate a series of scenes, each with a textual description and a corresponding image. Return a JSON array of scenes. Each scene must have fields \"sceneDescription\" and \"imageUri\". The imageUri must be in data URI format.
`,
});

const generateStoryboardFlow = ai.defineFlow(
  {
    name: 'generateStoryboardFlow',
    inputSchema: GenerateStoryboardInputSchema,
    outputSchema: GenerateStoryboardOutputSchema,
  },
  async input => {
    const numScenes = 3; // Generate 3 scenes for the storyboard
    const storyboardScenes: any[] = [];

    for (let i = 0; i < numScenes; i++) {
      // Augment the user prompt with scene-specific details
      const augmentedInput = {
        ...input,
        userPrompts: `${input.userPrompts} Scene ${i + 1}: Focus on a key moment.`, // adding scene details
      };

      const {output} = await generateStoryboardPrompt(augmentedInput);
      if (output && Array.isArray(output)) {
        storyboardScenes.push(...output);
      } else {
        console.warn("Unexpected output format from generateStoryboardPrompt:", output);
        // Handle the unexpected output, e.g., by returning a default scene or throwing an error
      }
    }

    return storyboardScenes as GenerateStoryboardOutput;
  }
);
