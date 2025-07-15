import { useState, useCallback } from 'react';
import type { 
  VoiceDetailDTO,
  ListVoicesResponseDTO, 
  DesignVoiceCommand, 
  DesignVoiceResponseDTO, 
  CreateVoiceCommand, 
  CreateVoiceResponseDTO,
  PromptImprovementCommand,
  PromptImprovementResponseDTO
} from '../../types';
import { 
  fetchVoices as fetchVoicesApi, 
  designVoice as designVoiceApi, 
  createVoice as createVoiceApi,
  deleteVoice as deleteVoiceApi,
  VoiceServiceError 
} from '../voiceService';
import { improvePrompt as improvePromptApi } from '../prompt';

interface UseVoicesResult {
  voices: VoiceDetailDTO[];
  isLoading: boolean;
  error: string | null;
  fetchVoices: () => Promise<void>;
  deleteVoice: (voiceId: string) => Promise<void>;
  refreshVoices: () => Promise<void>;
}

export function useFetchVoices(): UseVoicesResult {
  const [voices, setVoices] = useState<VoiceDetailDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ListVoicesResponseDTO = await fetchVoicesApi();
      setVoices(response.items);
    } catch (err) {
      const errorMessage = err instanceof VoiceServiceError 
        ? err.message 
        : 'Failed to fetch voices';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteVoice = useCallback(async (voiceId: string) => {
    try {
      await deleteVoiceApi(voiceId);
      setVoices(prev => prev.filter(voice => voice.id !== voiceId));
    } catch (err) {
      const errorMessage = err instanceof VoiceServiceError 
        ? err.message 
        : 'Failed to delete voice';
      setError(errorMessage);
    }
  }, []);

  const refreshVoices = useCallback(async () => {
    await fetchVoices();
  }, [fetchVoices]);

  return {
    voices,
    isLoading,
    error,
    fetchVoices,
    deleteVoice,
    refreshVoices
  };
}

interface UseDesignVoiceResult {
  isDesigning: boolean;
  error: string | null;
  designVoice: (command: DesignVoiceCommand) => Promise<DesignVoiceResponseDTO | null>;
}

export function useDesignVoice(): UseDesignVoiceResult {
  const [isDesigning, setIsDesigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const designVoice = useCallback(async (command: DesignVoiceCommand): Promise<DesignVoiceResponseDTO | null> => {
    try {
      setIsDesigning(true);
      setError(null);
      const response = await designVoiceApi(command);
      return response;
    } catch (err) {
      const errorMessage = err instanceof VoiceServiceError 
        ? err.message 
        : 'Failed to design voice';
      setError(errorMessage);
      return null;
    } finally {
      setIsDesigning(false);
    }
  }, []);

  return {
    isDesigning,
    error,
    designVoice
  };
}

interface UseCreateVoiceResult {
  isCreating: boolean;
  error: string | null;
  createVoice: (command: CreateVoiceCommand) => Promise<CreateVoiceResponseDTO | null>;
}

export function useCreateVoice(): UseCreateVoiceResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVoice = useCallback(async (command: CreateVoiceCommand): Promise<CreateVoiceResponseDTO | null> => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await createVoiceApi(command);
      return response;
    } catch (err) {
      const errorMessage = err instanceof VoiceServiceError 
        ? err.message 
        : 'Failed to create voice';
      setError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    isCreating,
    error,
    createVoice
  };
}

interface UsePromptImprovementResult {
  isImproving: boolean;
  error: string | null;
  improvePrompt: (command: PromptImprovementCommand) => Promise<PromptImprovementResponseDTO | null>;
}

export function usePromptImprovement(): UsePromptImprovementResult {
  const [isImproving, setIsImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const improvePrompt = useCallback(async (command: PromptImprovementCommand): Promise<PromptImprovementResponseDTO | null> => {
    try {
      setIsImproving(true);
      setError(null);
      const response = await improvePromptApi(command);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to improve prompt';
      setError(errorMessage);
      return null;
    } finally {
      setIsImproving(false);
    }
  }, []);

  return {
    isImproving,
    error,
    improvePrompt
  };
} 