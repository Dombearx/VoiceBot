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


class CreateVoiceCommand(CamelModel):
    prompt: str
    loudness: float
    creativity: float


# Prompt Improvement
class PromptImprovementCommand(CamelModel):
    prompt: str


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