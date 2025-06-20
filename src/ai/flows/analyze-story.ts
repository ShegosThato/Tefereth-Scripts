// 'use server';

/**
 * @fileOverview AI Story Analysis tool.
 *
 * - analyzeStory - A function that handles the story analysis process.
 * - AnalyzeStoryInput - The input type for the analyzeStory function.
 * - AnalyzeStoryOutput - The return type for the analyzeStory function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStoryInputSchema = z.object({
  storyText: z
    .string()
    .describe('The text of the story to be analyzed.  Must be less than 10000 characters.'),
});
export type AnalyzeStoryInput = z.infer<typeof AnalyzeStoryInputSchema>;

const AnalyzeStoryOutputSchema = z.object({
  themes: z.array(z.string()).describe('Key themes identified in the story.'),
  characters: z
    .array(z.string())
    .describe('Main characters and their descriptions from the story.'),
  structure: z
    .string()
    .describe('A summary of the story structure, including the beginning, rising action, climax, falling action, and resolution.'),
  summary: z.string().describe('A brief summary of the story.'),
});
export type AnalyzeStoryOutput = z.infer<typeof AnalyzeStoryOutputSchema>;

export async function analyzeStory(input: AnalyzeStoryInput): Promise<AnalyzeStoryOutput> {
  return analyzeStoryFlow(input);
}

const analyzeStoryPrompt = ai.definePrompt({
  name: 'analyzeStoryPrompt',
  input: {schema: AnalyzeStoryInputSchema},
  output: {schema: AnalyzeStoryOutputSchema},
  prompt: `You are a literary expert. Analyze the provided story and identify key themes, main characters, story structure, and provide a summary.

Story:
{{storyText}}`,
});

const analyzeStoryFlow = ai.defineFlow(
  {
    name: 'analyzeStoryFlow',
    inputSchema: AnalyzeStoryInputSchema,
    outputSchema: AnalyzeStoryOutputSchema,
  },
  async input => {
    const {output} = await analyzeStoryPrompt(input);
    return output!;
  }
);
