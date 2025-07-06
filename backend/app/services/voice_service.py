"""
Voice Service - Business logic for voice management operations.
"""

from typing import List
from app.models import VoiceDetailDTO
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