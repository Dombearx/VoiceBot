"""
Voice Service - Business logic for voice management operations.
"""

import asyncio
from datetime import datetime
from typing import List

from app.models import VoiceDetailDTO, CreateVoiceCommand, VoiceDTO, VoiceSampleDTO, DesignVoiceCommand, DesignVoiceResponseDTO, VoicePreviewDTO
from app.services.elevenlabs_client import ElevenLabsAPIClient


def list_voices(client: ElevenLabsAPIClient) -> List[VoiceDetailDTO]:
    """
    Retrieve all available voices from ElevenLabs API.
    
    Args:
        client: ElevenLabs API client instance.
        
    Returns:
        List of VoiceDetailDTO objects containing voice information with samples.
        
    Raises:
        httpx.HTTPStatusError: If the API request fails.
        ValueError: If the response format is invalid.
    """
    try:
        voices = client.list_voices()
        return voices
    except Exception as e:
        # Re-raise the exception to let the router handle it
        raise e


def create_elevenlabs_client() -> ElevenLabsAPIClient:
    """
    Factory function to create an ElevenLabs API client.
    
    Returns:
        ElevenLabsAPIClient instance.
        
    Raises:
        ValueError: If the API key is not configured.
    """
    return ElevenLabsAPIClient()


def design_voice(command: DesignVoiceCommand) -> DesignVoiceResponseDTO:
    """
    Design a voice and return previews for user selection.
    
    Args:
        command: DesignVoiceCommand with prompt, sample_text, loudness, and creativity
        
    Returns:
        DesignVoiceResponseDTO: Voice previews with audio samples
        
    Raises:
        ValueError: If input validation fails or ElevenLabs API errors
        Exception: If ElevenLabs API calls fail
    """
    client = create_elevenlabs_client()
    
    # Handle sample_text validation for ElevenLabs API
    sample_text = command.sample_text if command.sample_text and len(command.sample_text) >= 100 else None
    
    # Call ElevenLabs design API
    voice_design = _design_voice(client, command.prompt, command.loudness, command.creativity, sample_text)
    
    # Map previews to DTOs
    previews = []
    for preview in voice_design.get("previews", []):
        preview_dto = VoicePreviewDTO(
            generated_voice_id=getattr(preview, 'generated_voice_id', ''),
            audio_base64=getattr(preview, 'audio_base_64', ''),
            media_type=getattr(preview, 'media_type', 'audio/mp3'),
            duration_secs=getattr(preview, 'duration_secs', 0.0)
        )
        previews.append(preview_dto)
    
    return DesignVoiceResponseDTO(
        previews=previews,
        text=voice_design.get("text", "")
    )


def create_voice(command: CreateVoiceCommand) -> VoiceDTO:
    """
    Create a voice from a selected preview.
    
    Args:
        command: CreateVoiceCommand with voice_name, voice_description, and generated_voice_id
        
    Returns:
        VoiceDTO: Created voice with metadata
        
    Raises:
        ValueError: If input validation fails or ElevenLabs API errors
        Exception: If ElevenLabs API calls fail
    """
    client = create_elevenlabs_client()
    
    # Create voice from preview
    created_voice = _create_voice_from_design(
        client, 
        command.voice_name, 
        command.voice_description, 
        command.generated_voice_id
    )
    
    # Create and return VoiceDTO (without samples for now)
    return VoiceDTO(
        id=created_voice["voice_id"],
        name=created_voice["name"],
        prompt=command.voice_description,
        created_at=datetime.fromtimestamp(created_voice.get("created_at_unix", 0)) if created_voice.get("created_at_unix") else datetime.utcnow(),
        samples=[]  # No samples needed for create response
    )

def _design_voice(client: ElevenLabsAPIClient, prompt: str, loudness: float, creativity: float, sample_text: str | None) -> dict:
    """
    Design a voice using ElevenLabs API.
    
    Args:
        client: ElevenLabs API client
        prompt: Voice description prompt (20-1000 characters)
        loudness: Volume level (-1 to 1)
        creativity: Guidance scale (0 to 100)
        sample_text: Text to generate speech with (100-1000 characters) or None for auto-generation
        
    Returns:
        dict: Voice design response from ElevenLabs with previews
        
    Raises:
        ValueError: If prompt is too short (< 20 characters)
    """
    # Validate prompt length for ElevenLabs API
    if len(prompt) < 20:
        raise ValueError("Voice description must be at least 20 characters long")
    
    return client.design_voice(
        voice_description=prompt,
        loudness=loudness,
        creativity=creativity,
        sample_text=sample_text
    )


def _create_voice_from_design(client: ElevenLabsAPIClient, voice_name: str, voice_description: str, generated_voice_id: str) -> dict:
    """
    Create a voice from design using ElevenLabs API.
    
    Args:
        client: ElevenLabs API client
        voice_name: Name for the new voice
        voice_description: Description for the new voice
        generated_voice_id: ID from design voice preview
        
    Returns:
        dict: Created voice data
    """
    return client.create_voice_from_preview(
        voice_name=voice_name,
        voice_description=voice_description,
        generated_voice_id=generated_voice_id
    )


def _map_previews_to_samples(previews: List, text: str) -> List[VoiceSampleDTO]:
    """
    Map ElevenLabs voice previews to VoiceSampleDTO objects.
    
    Args:
        previews: List of preview objects from ElevenLabs design API
        text: Text used for the previews
        
    Returns:
        List[VoiceSampleDTO]: List of mapped samples
    """
    samples = []
    
    for i, preview in enumerate(previews):
        # Create audio URL from base64 data
        audio_base64 = getattr(preview, 'audio_base_64', '')
        media_type = getattr(preview, 'media_type', 'audio/mp3')
        
        sample = VoiceSampleDTO(
            id=getattr(preview, 'generated_voice_id', f"preview_{i}"),
            text=text,
            audio_url=f"data:{media_type};base64,{audio_base64}"
        )
        samples.append(sample)
    
    return samples 