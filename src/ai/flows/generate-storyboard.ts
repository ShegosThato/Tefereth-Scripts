// Use server directive is required for Genkit flows.
'use server';

/**
 * @fileOverview Generates a list of scene descriptions based on a story analysis.
 *
 * - generateStoryboard - A function to generate a storyboard.
 * - GenerateStoryboardInput - Input type for generateStoryboard.
 * - GenerateStoryboardOutput - Output type for generateStoryboard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateStoryboardInputSchema = z.object({
  storyAnalysis: z.string().describe('The AI analysis of the story, including key themes, characters, and structural elements.'),
  userPrompts: z.string().describe('User-provided textual prompts to guide the storyboard generation.'),
});
export type GenerateStoryboardInput = z.infer<typeof GenerateStoryboardInputSchema>;

export const GenerateStoryboardOutputSchema = z.array(z.string()).describe('An array of 3-5 scene descriptions for the storyboard.');
export type GenerateStoryboardOutput = z.infer<typeof GenerateStoryboardOutputSchema>;

export async function generateStoryboard(input: GenerateStoryboardInput): Promise<GenerateStoryboardOutput> {
  return generateStoryboardFlow(input);
}

const generateStoryboardPrompt = ai.definePrompt({
  name: 'generateStoryboardPrompt',
  input: {schema: GenerateStoryboardInputSchema},
  output: {schema: GenerateStoryboardOutputSchema},
  prompt: `Based on the story analysis and user prompts, create a visual storyboard with 3-5 key scenes.

Story Analysis: {{{storyAnalysis}}}
User Prompts: {{{userPrompts}}}

Generate a JSON array of strings, where each string is a detailed textual description of a key scene.
`,
});

const generateStoryboardFlow = ai.defineFlow(
  {
    name: 'generateStoryboardFlow',
    inputSchema: GenerateStoryboardInputSchema,
    outputSchema: GenerateStoryboardOutputSchema,
  },
  async input => {
    const {output} = await generateStoryboardPrompt(input);
    return (output || []) as GenerateStoryboardOutput;
  }
);
