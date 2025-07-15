import { useState, useCallback, useEffect } from 'react';
import type { 
  DiscordBotStatusDTO, 
  VoiceChannelDTO, 
  ConnectBotCommand, 
  BotConfigCommand,
  BotConfigResponseDTO,
  PlayCommand 
} from '../../types';
import { 
  fetchDiscordBotStatus as fetchStatusApi,
  fetchVoiceChannels as fetchChannelsApi,
  connectDiscordBot as connectBotApi,
  disconnectDiscordBot as disconnectBotApi,
  updateDiscordBotConfig as updateConfigApi,
  playAudio as playAudioApi,
  DiscordBotServiceError 
} from '../discordBotService';

// Hook for bot status management
interface UseBotStatusResult {
  status: DiscordBotStatusDTO | null;
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  updateStatus: (status: DiscordBotStatusDTO) => void;
}

export function useBotStatus(): UseBotStatusResult {
  const [status, setStatus] = useState<DiscordBotStatusDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchStatusApi();
      setStatus(response);
    } catch (err) {
      const errorMessage = err instanceof DiscordBotServiceError 
        ? err.message 
        : 'Failed to fetch bot status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshStatus = useCallback(() => fetchStatus(), [fetchStatus]);
  
  const updateStatus = useCallback((newStatus: DiscordBotStatusDTO) => {
    setStatus(newStatus);
  }, []);

  return {
    status,
    isLoading,
    error,
    fetchStatus,
    refreshStatus,
    updateStatus
  };
}

// Hook for voice channels management
interface UseChannelsResult {
  channels: VoiceChannelDTO[];
  isLoading: boolean;
  error: string | null;
  fetchChannels: () => Promise<void>;
  refreshChannels: () => Promise<void>;
}

export function useChannels(): UseChannelsResult {
  const [channels, setChannels] = useState<VoiceChannelDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchChannelsApi();
      setChannels(response);
    } catch (err) {
      const errorMessage = err instanceof DiscordBotServiceError 
        ? err.message 
        : 'Failed to fetch voice channels';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshChannels = useCallback(() => fetchChannels(), [fetchChannels]);

  return {
    channels,
    isLoading,
    error,
    fetchChannels,
    refreshChannels
  };
}

// Hook for bot connection management
interface UseBotConnectionResult {
  isConnecting: boolean;
  isDisconnecting: boolean;
  error: string | null;
  connectBot: (command: ConnectBotCommand) => Promise<void>;
  disconnectBot: () => Promise<DiscordBotStatusDTO>;
}

export function useBotConnection(): UseBotConnectionResult {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectBot = useCallback(async (command: ConnectBotCommand) => {
    try {
      setIsConnecting(true);
      setError(null);
      await connectBotApi(command);
    } catch (err) {
      const errorMessage = err instanceof DiscordBotServiceError 
        ? err.message 
        : 'Failed to connect bot';
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectBot = useCallback(async (): Promise<DiscordBotStatusDTO> => {
    try {
      setIsDisconnecting(true);
      setError(null);
      const status = await disconnectBotApi();
      return status;
    } catch (err) {
      const errorMessage = err instanceof DiscordBotServiceError 
        ? err.message 
        : 'Failed to disconnect bot';
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsDisconnecting(false);
    }
  }, []);

  return {
    isConnecting,
    isDisconnecting,
    error,
    connectBot,
    disconnectBot
  };
}

// Hook for bot configuration management
interface UseBotConfigResult {
  isUpdating: boolean;
  error: string | null;
  updateConfig: (command: BotConfigCommand) => Promise<BotConfigResponseDTO>;
}

export function useBotConfig(): UseBotConfigResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateConfig = useCallback(async (command: BotConfigCommand): Promise<BotConfigResponseDTO> => {
    try {
      setIsUpdating(true);
      setError(null);
      const response = await updateConfigApi(command);
      return response;
    } catch (err) {
      const errorMessage = err instanceof DiscordBotServiceError 
        ? err.message 
        : 'Failed to update bot configuration';
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    isUpdating,
    error,
    updateConfig
  };
}

// Hook for playing speech
interface UsePlaySpeechResult {
  isPlaying: boolean;
  error: string | null;
  playAudio: (command: PlayCommand) => Promise<void>;
  cancelPlay: () => void;
}

export function usePlaySpeech(): UsePlaySpeechResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const playAudio = useCallback(async (command: PlayCommand) => {
    try {
      setIsPlaying(true);
      setError(null);
      
      // Create new AbortController for this request
      const controller = new AbortController();
      setAbortController(controller);
      
      await playAudioApi(command);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't set error
        return;
      }
      
      const errorMessage = err instanceof DiscordBotServiceError 
        ? err.message 
        : 'Failed to play audio';
      setError(errorMessage);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsPlaying(false);
      setAbortController(null);
    }
  }, []);

  const cancelPlay = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsPlaying(false);
    }
  }, [abortController]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  return {
    isPlaying,
    error,
    playAudio,
    cancelPlay
  };
} 