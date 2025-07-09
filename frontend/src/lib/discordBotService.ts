/**
 * Discord Bot Service - Frontend service for Discord bot API communication
 */

import type { DiscordBotStatusDTO } from '../types';

const API_BASE_URL = '/api'; // Proxy to backend

/**
 * Fetch the current status of the Discord bot
 * 
 * @returns Promise<DiscordBotStatusDTO> Current bot status
 * @throws Error if the API request fails
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
      throw new Error(`Failed to fetch Discord bot status: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: DiscordBotStatusDTO = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Discord bot status request failed: ${error.message}`);
    }
    throw new Error('Discord bot status request failed: Unknown error');
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