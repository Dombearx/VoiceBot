/**
 * Discord Bot Service - Frontend service for Discord bot API communication
 */

import type { 
  DiscordBotStatusDTO, 
  VoiceChannelDTO, 
  ConnectBotCommand, 
  BotConfigCommand, 
  BotConfigResponseDTO 
} from '../types';

const API_BASE_URL = '/api'; // Proxy to backend

/**
 * Custom error class for Discord bot API errors
 */
export class DiscordBotServiceError extends Error {
  public status?: number;
  public originalError?: Error;

  constructor(
    message: string,
    status?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'DiscordBotServiceError';
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * Fetch the current status of the Discord bot
 * 
 * @returns Promise<DiscordBotStatusDTO> Current bot status
 * @throws DiscordBotServiceError if the API request fails
 */
export async function fetchDiscordBotStatus(): Promise<DiscordBotStatusDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/discord-bot/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

      throw new DiscordBotServiceError(
        `Failed to fetch Discord bot status: ${errorMessage}`,
        response.status
      );
    }

    const data: DiscordBotStatusDTO = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DiscordBotServiceError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DiscordBotServiceError(
        'Network error: Unable to connect to the API server',
        0,
        error
      );
    }

    throw new DiscordBotServiceError(
      `Discord bot status request failed: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetch list of available voice channels
 * 
 * @returns Promise<VoiceChannelDTO[]> List of available voice channels
 * @throws DiscordBotServiceError if the API request fails
 */
export async function fetchVoiceChannels(): Promise<VoiceChannelDTO[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/discord-bot/channels`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

      throw new DiscordBotServiceError(
        `Failed to fetch voice channels: ${errorMessage}`,
        response.status
      );
    }

    const data: VoiceChannelDTO[] = await response.json();
    
    // Validate response structure
    if (!Array.isArray(data)) {
      throw new DiscordBotServiceError(
        'Invalid response format: expected array of voice channels'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof DiscordBotServiceError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DiscordBotServiceError(
        'Network error: Unable to connect to the API server',
        0,
        error
      );
    }

    throw new DiscordBotServiceError(
      `Voice channels request failed: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Connect the Discord bot to a voice channel
 * 
 * @param command - ConnectBotCommand with channel ID
 * @returns Promise<DiscordBotStatusDTO> Connection status after connecting
 * @throws DiscordBotServiceError if the API request fails
 */
export async function connectDiscordBot(command: ConnectBotCommand): Promise<DiscordBotStatusDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/discord-bot/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

      throw new DiscordBotServiceError(
        `Failed to connect Discord bot: ${errorMessage}`,
        response.status
      );
    }

    const data: DiscordBotStatusDTO = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DiscordBotServiceError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DiscordBotServiceError(
        'Network error: Unable to connect to the API server',
        0,
        error
      );
    }

    throw new DiscordBotServiceError(
      `Discord bot connect request failed: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Disconnect the Discord bot from the current voice channel
 * 
 * @returns Promise<DiscordBotStatusDTO> Connection status after disconnecting
 * @throws DiscordBotServiceError if the API request fails
 */
export async function disconnectDiscordBot(): Promise<DiscordBotStatusDTO> {
  try {
    const response = await fetch(`${API_BASE_URL}/discord-bot/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

      throw new DiscordBotServiceError(
        `Failed to disconnect Discord bot: ${errorMessage}`,
        response.status
      );
    }

    const data: DiscordBotStatusDTO = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DiscordBotServiceError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DiscordBotServiceError(
        'Network error: Unable to connect to the API server',
        0,
        error
      );
    }

    throw new DiscordBotServiceError(
      `Discord bot disconnect request failed: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Update Discord bot configuration (server nickname and avatar)
 * 
 * @param command - BotConfigCommand with nickname and optional avatar file
 * @returns Promise<BotConfigResponseDTO> Updated bot configuration
 * @throws DiscordBotServiceError if the API request fails
 */
export async function updateDiscordBotConfig(command: BotConfigCommand): Promise<BotConfigResponseDTO> {
  try {
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('nickname', command.nickname);
    
    if (command.avatar) {
      formData.append('avatar', command.avatar);
    }

    const response = await fetch(`${API_BASE_URL}/discord-bot/config`, {
      method: 'PATCH',
      body: formData, // Don't set Content-Type header - let browser set it with boundary
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

      throw new DiscordBotServiceError(
        `Failed to update Discord bot config: ${errorMessage}`,
        response.status
      );
    }

    const data: BotConfigResponseDTO = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DiscordBotServiceError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DiscordBotServiceError(
        'Network error: Unable to connect to the API server',
        0,
        error
      );
    }

    throw new DiscordBotServiceError(
      `Discord bot config update request failed: ${error instanceof Error ? error.message : String(error)}`,
      0,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Check if the Discord bot is connected
 * 
 * @returns Promise<boolean> True if bot is connected, false otherwise
 */
export async function isDiscordBotConnected(): Promise<boolean> {
  try {
    const status = await fetchDiscordBotStatus();
    return status.connected;
  } catch (error) {
    console.error('Error checking Discord bot connection:', error);
    return false;
  }
}

/**
 * Get the current voice channel ID if bot is connected to one
 * 
 * @returns Promise<string | null> Channel ID or null if not connected to voice channel
 */
export async function getCurrentVoiceChannelId(): Promise<string | null> {
  try {
    const status = await fetchDiscordBotStatus();
    return status.connected ? status.channelId || null : null;
  } catch (error) {
    console.error('Error getting current voice channel:', error);
    return null;
  }
}

/**
 * Check if Discord bot API is available
 * 
 * @returns Promise<boolean> True if API is available, false otherwise
 */
export async function checkDiscordBotApiHealth(): Promise<boolean> {
  try {
    await fetchDiscordBotStatus();
    return true;
  } catch {
    return false;
  }
} 