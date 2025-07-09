import type { PromptImprovementCommand, PromptImprovementResponseDTO } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Improve a prompt using AI assistance.
 * 
 * @param command - Command containing the prompt to improve
 * @returns Promise resolving to the improved prompt response
 * @throws Error if the API call fails
 */
export async function improvePrompt(
  command: PromptImprovementCommand
): Promise<PromptImprovementResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/prompts/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          // Handle Pydantic validation errors
          errorMessage = errorData.detail.map((err: { msg: string }) => err.msg).join(', ');
        } else {
          errorMessage = errorData.detail;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to improve prompt');
  }
} 