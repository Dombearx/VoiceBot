// frontend/src/types.ts
// DTOs and Command Models for VoiceBot application

// Shared types
export type ApiType = 'voice_generation' | 'tts' | 'prompt_improvement';

// Voice Management
export interface VoiceSampleDTO {
  id: string;
  text: string;
  audioUrl: string;
}

export interface VoiceDTO {
  id: string;
  name: string;
  prompt: string;
  createdAt: string; // ISO8601 UTC
  samples: VoiceSampleDTO[];
}

export interface ListVoicesResponseDTO {
  items: VoiceDTO[];
}

export interface DesignVoiceCommand {
  prompt: string;
  sampleText?: string;
  loudness?: number;
  creativity?: number;
}

export interface VoicePreviewDTO {
  generatedVoiceId: string;
  audioBase64: string;
  mediaType: string;
  durationSecs: number;
}

export interface DesignVoiceResponseDTO {
  previews: VoicePreviewDTO[];
  text: string;
}

export interface CreateVoiceCommand {
  voiceName: string;
  voiceDescription: string;
  generatedVoiceId: string;
}

export type CreateVoiceResponseDTO = VoiceDTO;

// Prompt Improvement
export interface PromptImprovementCommand {
  prompt: string;
}

export interface PromptImprovementResponseDTO {
  improvedPrompt: string;
}

// Text-to-Speech
export interface TextToSpeechCommand {
  voiceId: string;
  text: string;
  timeout: number; // seconds, max 30
}

export interface TextToSpeechResponseDTO {
  // Placeholder: structure returned by /tts (TBD)
  voices: unknown;
}

// Generation Metrics
export interface GenerationMetricsQueryParams {
  voiceId?: string;
  apiType?: ApiType;
  from?: string; // ISO8601
  to?: string;   // ISO8601
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface GenerationMetricDTO {
  id: string;
  voiceId: string;
  tokenCount: number;
  textLength: number;
  apiType: ApiType;
  createdAt: string;
}

export interface GenerationMetricsResponseDTO {
  items: GenerationMetricDTO[];
  page: number;
  limit: number;
  total: number;
}

// Error Logs
export interface ErrorLogsQueryParams {
  voiceId?: string;
  apiType?: ApiType;
  from?: string; // ISO8601
  to?: string;   // ISO8601
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ErrorLogDTO {
  id: string;
  voiceId: string;
  errorMessage: string;
  apiType: ApiType;
  createdAt: string;
}

export interface ErrorLogsResponseDTO {
  items: ErrorLogDTO[];
  page: number;
  limit: number;
  total: number;
}

// Discord Bot
export interface DiscordBotStatusDTO {
  connected: boolean;
  channelId?: string;
}

export interface VoiceChannelDTO {
  id: string;
  name: string;
}

export interface ConnectBotCommand {
  channelId: string;
}

export interface BotConfigCommand {
  name: string;
  avatar: File; // multipart/form-data file
}

export interface BotConfigResponseDTO {
  name: string;
  avatarUrl: string;
}

export interface PlayCommand {
  voiceId: string;
  text: string;
} 