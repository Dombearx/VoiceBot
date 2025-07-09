from datetime import datetime
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field, ConfigDict


def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# Shared enum matching DB api_type
class ApiType(str, Enum):
    voice_generation = 'voice_generation'
    tts = 'tts'
    prompt_improvement = 'prompt_improvement'


# Voice Management
class VoiceSampleDTO(CamelModel):
    id: str
    text: str
    audio_url: str


class VoiceDTO(CamelModel):
    id: str
    name: str
    prompt: str
    created_at: datetime  # serialized as createdAt
    samples: list[VoiceSampleDTO] = Field(default_factory=list)


class VoiceDetailDTO(CamelModel):
    id: str
    name: str
    prompt: str
    created_at: datetime
    samples: list[VoiceSampleDTO]


class ListVoicesResponseDTO(CamelModel):
    items: list[VoiceDetailDTO]


class DesignVoiceCommand(CamelModel):
    prompt: str = Field(..., min_length=20, max_length=1000, description="Voice description (20-1000 characters)")
    sample_text: str = Field(None, min_length=100, max_length=1000, description="Sample text for voice generation (100-1000 characters), optional - will auto-generate if not provided")
    loudness: float = Field(0.5, ge=-1.0, le=1.0, description="Volume level (-1 to 1, 0 is roughly -24 LUFS)")
    creativity: float = Field(5.0, ge=0.0, le=100.0, description="Guidance scale (0-100, lower = more creative)")


class VoicePreviewDTO(CamelModel):
    generated_voice_id: str
    audio_base64: str
    media_type: str
    duration_secs: float


class DesignVoiceResponseDTO(CamelModel):
    previews: list[VoicePreviewDTO]
    text: str


class CreateVoiceCommand(CamelModel):
    voice_name: str = Field(..., min_length=1, max_length=100, description="Name for the new voice")
    voice_description: str = Field(..., min_length=20, max_length=1000, description="Description for the new voice (20-1000 characters)")
    generated_voice_id: str = Field(..., description="ID of the selected voice preview from design endpoint")


# Prompt Improvement
class PromptImprovementCommand(CamelModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Prompt to improve (1-1000 characters)")


class PromptImprovementResponseDTO(CamelModel):
    improved_prompt: str


# Text-to-Speech
class TextToSpeechCommand(CamelModel):
    voice_id: str
    text: str
    timeout: int = Field(default=30)


class TextToSpeechResponseDTO(CamelModel):
    voices: list[Any]  # placeholder for TTS response structure


# Generation Metrics
class GenerationMetricDTO(CamelModel):
    id: str
    voice_id: str
    token_count: int
    text_length: int
    api_type: ApiType
    created_at: datetime


class GenerationMetricsResponseDTO(CamelModel):
    items: list[GenerationMetricDTO]
    page: int
    limit: int
    total: int


# Error Logs
class ErrorLogDTO(CamelModel):
    id: str
    voice_id: str
    error_message: str
    api_type: ApiType
    created_at: datetime


class ErrorLogsResponseDTO(CamelModel):
    items: list[ErrorLogDTO]
    page: int
    limit: int
    total: int


# Discord Bot
class DiscordBotStatusDTO(CamelModel):
    connected: bool
    channel_id: str | None = None


class VoiceChannelDTO(CamelModel):
    id: str
    name: str


class ConnectBotCommand(CamelModel):
    channel_id: str


class BotConfigCommand(CamelModel):
    name: str
    avatar: bytes  # uploaded file content; handled in endpoint


class BotConfigResponseDTO(CamelModel):
    name: str
    avatar_url: str


class PlayCommand(CamelModel):
    voice_id: str
    text: str 