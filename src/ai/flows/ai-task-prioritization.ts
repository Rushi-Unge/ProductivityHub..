// src/ai/flows/ai-task-prioritization.ts
'use server';

/**
 * @fileOverview AI-powered task prioritization flow.
 *
 * This flow analyzes a list of tasks with deadlines and descriptions and suggests an optimal
 * prioritization order based on urgency and importance.
 *
 * @interface AiTaskPrioritizationInput - Input for the aiTaskPrioritization flow.
 * @interface AiTaskPrioritizationOutput - Output of the aiTaskPrioritization flow, providing a prioritized task list.
 * @function aiTaskPrioritization - The main function to trigger the task prioritization process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTaskPrioritizationInputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().describe('The title of the task.'),
      description: z.string().describe('A detailed description of the task.'),
      deadline: z.string().describe('The deadline for the task (e.g., YYYY-MM-DD).'),
      importance: z
        .enum(['low', 'medium', 'high'])
        .describe('The importance level of the task.'),
    })
  ).describe('A list of tasks to prioritize.'),
});
export type AiTaskPrioritizationInput = z.infer<typeof AiTaskPrioritizationInputSchema>;

const AiTaskPrioritizationOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      title: z.string().describe('The title of the task.'),
      description: z.string().describe('A detailed description of the task.'),
      deadline: z.string().describe('The deadline for the task (e.g., YYYY-MM-DD).'),
      importance: z
        .enum(['low', 'medium', 'high'])
        .describe('The importance level of the task.'),
      reason: z.string().describe('Explanation of why the task was prioritized this way.'),
      priority: z.number().describe('The numerical priority of the task. Lower number means higher priority.')
    })
  ).describe('The list of tasks, prioritized with explanations.'),
});
export type AiTaskPrioritizationOutput = z.infer<typeof AiTaskPrioritizationOutputSchema>;

export async function aiTaskPrioritization(input: AiTaskPrioritizationInput): Promise<AiTaskPrioritizationOutput> {
  return aiTaskPrioritizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTaskPrioritizationPrompt',
  input: {schema: AiTaskPrioritizationInputSchema},
  output: {schema: AiTaskPrioritizationOutputSchema},
  prompt: `You are an AI task prioritization assistant. Analyze the list of tasks below and return a prioritized list with explanations for each task's priority.

Tasks:
{{#each tasks}}
- Title: {{this.title}}
  Description: {{this.description}}
  Deadline: {{this.deadline}}
  Importance: {{this.importance}}
{{/each}}

Prioritized Tasks (include a priority number, starting from 1 as highest priority):
`,
});

const aiTaskPrioritizationFlow = ai.defineFlow(
  {
    name: 'aiTaskPrioritizationFlow',
    inputSchema: AiTaskPrioritizationInputSchema,
    outputSchema: AiTaskPrioritizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
