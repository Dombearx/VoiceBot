/**
 * Voice Service - HTTP client for voice management operations
 */

import type { ListVoicesResponseDTO, VoiceDTO } from '../types';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * HTTP client configuration
 */
const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 * Custom error class for API errors
 */
export class VoiceServiceError extends Error {
  public status?: number;
  public originalError?: Error;

  constructor(
    message: string,
    status?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'VoiceServiceError';
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * Fetch all available voices from the API
 * 
 * @returns Promise<ListVoicesResponseDTO> - Response containing list of voices with samples
 * @throws VoiceServiceError - If the API request fails
 */
export async function fetchVoices(): Promise<ListVoicesResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/voices/`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // If response is not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }

      throw new VoiceServiceError(
        `Failed to fetch voices: ${errorMessage}`,
        response.status
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
      throw new VoiceServiceError(
        'Invalid response format: expected object with items array'
      );
    }

    return data as ListVoicesResponseDTO;

  } catch (error) {
    if (error instanceof VoiceServiceError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new VoiceServiceError(
        'Network error: Unable to connect to the API server',
        0,
        error
      );
    }

    // Handle other errors
    throw new VoiceServiceError(
      `Unexpected error while fetching voices: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Get a specific voice by ID
 * Note: This is a helper function that filters the voices list
 * In the future, this could be replaced with a dedicated API endpoint
 * 
 * @param voiceId - ID of the voice to retrieve
 * @returns Promise<VoiceDTO | null> - Voice data or null if not found
 * @throws VoiceServiceError - If the API request fails
 */
export async function getVoiceById(voiceId: string): Promise<VoiceDTO | null> {
  const response = await fetchVoices();
  const voice = response.items.find(v => v.id === voiceId);
  return voice || null;
}

/**
 * Check if the API is available
 * 
 * @returns Promise<boolean> - True if API is available, false otherwise
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: defaultHeaders,
    });

    return response.ok;
  } catch {
    return false;
  }
} 