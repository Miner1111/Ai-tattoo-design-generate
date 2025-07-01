'use server';

/**
 * @fileOverview Simulates tattoo placement on different body parts using GenAI.
 *
 * - simulateTattooPlacement - A function that handles the tattoo placement simulation process.
 * - SimulateTattooPlacementInput - The input type for the simulateTattooPlacement function.
 * - SimulateTattooPlacementOutput - The return type for the simulateTattooPlacement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const SimulateTattooPlacementInputSchema = z.object({
  tattooDataUri: z
    .string()
    .describe(
      "A tattoo design as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  bodyPart: z.string().describe('The body part where the tattoo will be placed (e.g., arm, leg, back).'),
  bodyPartPhotoUri: z
    .string()
    .describe(
      "A photo of the body part where the tattoo will be placed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SimulateTattooPlacementInput = z.infer<typeof SimulateTattooPlacementInputSchema>;

const SimulateTattooPlacementOutputSchema = z.object({
  simulatedTattooUri: z
    .string()
    .describe(
      'An image of the tattoo design simulated on the specified body part, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected the escaping
    ),
});
export type SimulateTattooPlacementOutput = z.infer<typeof SimulateTattooPlacementOutputSchema>;

export async function simulateTattooPlacement(input: SimulateTattooPlacementInput): Promise<SimulateTattooPlacementOutput> {
  return simulateTattooPlacementFlow(input);
}

const simulateTattooPlacementPrompt = ai.definePrompt({
  name: 'simulateTattooPlacementPrompt',
  input: {schema: SimulateTattooPlacementInputSchema},
  output: {schema: SimulateTattooPlacementOutputSchema},
  prompt: `You are a tattoo placement simulator. Given a tattoo design and a photo of a body part, simulate how the tattoo would look on that body part.

Tattoo Design: {{media url=tattooDataUri}}
Body Part: {{bodyPart}}
Body Part Photo: {{media url=bodyPartPhotoUri}}

Create a realistic simulation of the tattoo on the specified body part and return the resulting image as a data URI.
`,
});

const simulateTattooPlacementFlow = ai.defineFlow(
  {
    name: 'simulateTattooPlacementFlow',
    inputSchema: SimulateTattooPlacementInputSchema,
    outputSchema: SimulateTattooPlacementOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
            {media: {url: input.tattooDataUri}},
            {media: {url: input.bodyPartPhotoUri}},
            {text: `Simulate this tattoo on the ${input.bodyPart}`},
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    return {simulatedTattooUri: media!.url!};
  }
);
