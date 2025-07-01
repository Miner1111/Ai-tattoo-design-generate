'use server';

/**
 * @fileOverview AI Tattoo Generator flow.
 *
 * - generateTattooDesign - A function that generates a tattoo design based on a text prompt.
 * - GenerateTattooDesignInput - The input type for the generateTattooDesign function.
 * - GenerateTattooDesignOutput - The return type for the generateTattooDesign function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTattooDesignInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the tattoo design.'),
});
export type GenerateTattooDesignInput = z.infer<typeof GenerateTattooDesignInputSchema>;

const GenerateTattooDesignOutputSchema = z.object({
  tattooDesign: z.object({
    url: z.string().describe('URL of the generated tattoo design image.'),
  }).describe('The generated tattoo design.'),
});
export type GenerateTattooDesignOutput = z.infer<typeof GenerateTattooDesignOutputSchema>;

export async function generateTattooDesign(input: GenerateTattooDesignInput): Promise<GenerateTattooDesignOutput> {
  return generateTattooDesignFlow(input);
}

const generateTattooDesignPrompt = ai.definePrompt({
  name: 'generateTattooDesignPrompt',
  input: {schema: GenerateTattooDesignInputSchema},
  output: {schema: GenerateTattooDesignOutputSchema},
  prompt: `Generate a tattoo design based on the following prompt: {{{prompt}}}.  The design should be high quality and suitable for tattooing. Return only a URL to the image.`, 
});

const generateTattooDesignFlow = ai.defineFlow(
  {
    name: 'generateTattooDesignFlow',
    inputSchema: GenerateTattooDesignInputSchema,
    outputSchema: GenerateTattooDesignOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No tattoo design was generated.');
    }

    return {
      tattooDesign: {
        url: media.url,
      },
    };
  }
);
