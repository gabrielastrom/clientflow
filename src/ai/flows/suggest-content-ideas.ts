'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating content suggestions based on social media trends and client information.
 *
 * - suggestContentIdeas - A function that triggers the content suggestion flow.
 * - ContentIdeasInput - The input type for the suggestContentIdeas function.
 * - ContentIdeasOutput - The output type for the suggestContentIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentIdeasInputSchema = z.object({
  clientDescription: z
    .string()
    .describe('A brief description of the client and their brand.'),
  socialTrends: z
    .string()
    .describe('Current social media trends to consider.'),
  platform: z
    .string()
    .describe('The social media platform for the content (e.g., Instagram, TikTok, X).'),
});
export type ContentIdeasInput = z.infer<typeof ContentIdeasInputSchema>;

const ContentIdeasOutputSchema = z.object({
  contentIdeas: z
    .array(z.string())
    .describe('A list of content ideas based on the input.'),
});
export type ContentIdeasOutput = z.infer<typeof ContentIdeasOutputSchema>;

export async function suggestContentIdeas(input: ContentIdeasInput): Promise<ContentIdeasOutput> {
  return suggestContentIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentIdeasPrompt',
  input: {schema: ContentIdeasInputSchema},
  output: {schema: ContentIdeasOutputSchema},
  prompt: `You are a social media expert. Generate content ideas for the following client on the specified platform, considering current social media trends.

Client Description: {{{clientDescription}}}
Social Media Trends: {{{socialTrends}}}
Platform: {{{platform}}}

Generate a list of content ideas that are relevant and engaging for the target audience.`,
});

const suggestContentIdeasFlow = ai.defineFlow(
  {
    name: 'suggestContentIdeasFlow',
    inputSchema: ContentIdeasInputSchema,
    outputSchema: ContentIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
