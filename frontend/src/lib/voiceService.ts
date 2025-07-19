/**
 * Voice Service - HTTP client for voice management operations
 */

import type { 
  ListVoicesResponseDTO, 
  VoiceDetailDTO,
  DesignVoiceCommand, 
  DesignVoiceResponseDTO, 
  CreateVoiceCommand, 
  CreateVoiceResponseDTO 
} from '../types';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
 * @returns Promise<VoiceDetailDTO | null> - Voice data or null if not found
 * @throws VoiceServiceError - If the API request fails
 */
export async function getVoiceById(voiceId: string): Promise<VoiceDetailDTO | null> {
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

/**
 * Design a voice and get previews for selection
 * 
 * @param command - DesignVoiceCommand with voice parameters
 * @returns Promise<DesignVoiceResponseDTO> - Voice previews with audio samples
 * @throws VoiceServiceError - If the API request fails
 */
export async function designVoice(command: DesignVoiceCommand): Promise<DesignVoiceResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/voices/design`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new VoiceServiceError(
        `Failed to design voice: ${errorMessage}`,
        response.status
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.previews)) {
      throw new VoiceServiceError(
        'Invalid response format: expected object with previews array'
      );
    }

    return data as DesignVoiceResponseDTO;

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
      `Unexpected error while designing voice: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Create a voice from a selected preview
 * 
 * @param command - CreateVoiceCommand with voice name, description, and generated voice ID
 * @returns Promise<CreateVoiceResponseDTO> - Created voice data
 * @throws VoiceServiceError - If the API request fails
 */
export async function createVoice(command: CreateVoiceCommand): Promise<CreateVoiceResponseDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/voices/`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new VoiceServiceError(
        `Failed to create voice: ${errorMessage}`,
        response.status
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object' || !data.id) {
      throw new VoiceServiceError(
        'Invalid response format: expected voice object with id'
      );
    }

    return data as CreateVoiceResponseDTO;

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
      `Unexpected error while creating voice: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Delete a voice by ID
 * 
 * @param voiceId - ID of the voice to delete
 * @returns Promise<void> - Resolves when voice is deleted
 * @throws VoiceServiceError - If the API request fails
 */
export async function deleteVoice(voiceId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new VoiceServiceError(
        `Failed to delete voice: ${errorMessage}`,
        response.status
      );
    }

    // 204 No Content - successful deletion
    return;

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
      `Unexpected error while deleting voice: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
} 