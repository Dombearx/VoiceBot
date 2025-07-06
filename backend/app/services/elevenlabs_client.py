"""
ElevenLabs API Client for voice management operations.
"""

import os
from datetime import datetime
from typing import Any, Dict, List
from elevenlabs import ElevenLabs
from app.models import VoiceDetailDTO, VoiceSampleDTO


class ElevenLabsAPIClient:
    """Client for interacting with ElevenLabs API."""
    
    def __init__(self, api_key: str | None = None):
        """Initialize the ElevenLabs API client.
        
        Args:
            api_key: ElevenLabs API key. If not provided, will be read from ELEVENLABS_API_KEY env var.
        """
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        if not self.api_key:
            raise ValueError("ElevenLabs API key is required. Set ELEVENLABS_API_KEY environment variable.")
        
        self.client = ElevenLabs(api_key=self.api_key)
    
    def list_voices(self) -> List[VoiceDetailDTO]:
        """
        Retrieve all voices from ElevenLabs API.
        
        Returns:
            List of VoiceDetailDTO objects containing voice information with samples.
            
        Raises:
            Exception: If the API request fails.
        """
        try:
            # Use the official ElevenLabs client to search voices
            response = self.client.voices.search(
                include_total_count=True,
                page_size=100,  # Get maximum voices per request
                voice_type="personal"
            )
            
            voices = []
            for voice_data in response.voices:
                voice_detail = self._map_voice_to_dto(voice_data)
                voices.append(voice_detail)
            
            return voices
            
        except Exception as e:
            raise Exception(f"Failed to retrieve voices from ElevenLabs API: {str(e)}") from e
    
    def _map_voice_to_dto(self, voice_data: Any) -> VoiceDetailDTO:
        """
        Map ElevenLabs API voice data to VoiceDetailDTO.
        
        Args:
            voice_data: Voice object from ElevenLabs API.
            
        Returns:
            VoiceDetailDTO object.
            
        Raises:
            ValueError: If required fields are missing.
        """
        try:
            # Extract required fields from the voice object
            voice_id = getattr(voice_data, 'voice_id', None)
            name = getattr(voice_data, 'name', None)
            description = getattr(voice_data, 'description', '') or ''
            created_at_unix = getattr(voice_data, 'created_at_unix', None)
            
            if not voice_id:
                raise ValueError("Missing required field: voice_id")
            if not name:
                raise ValueError("Missing required field: name")
            
            # Convert Unix timestamp to datetime
            if created_at_unix:
                created_at = datetime.fromtimestamp(created_at_unix)
            else:
                # Fallback to current time if not provided
                created_at = datetime.now()
            
            # Map samples
            samples = []
            raw_samples = getattr(voice_data, 'samples', []) or []
            for sample_data in raw_samples:
                sample = self._map_sample_to_dto(sample_data, voice_id)
                if sample:
                    samples.append(sample)
            
            return VoiceDetailDTO(
                id=voice_id,
                name=name,
                prompt=description,  # Using description as prompt for now
                created_at=created_at,
                samples=samples
            )
            
        except (AttributeError, ValueError) as e:
            raise ValueError(f"Failed to map voice data: {str(e)}") from e
    
    def _map_sample_to_dto(self, sample_data: Any, voice_id: str) -> VoiceSampleDTO | None:
        """
        Map ElevenLabs API sample data to VoiceSampleDTO.
        
        Args:
            sample_data: Sample object from ElevenLabs API.
            voice_id: Voice ID for constructing audio URL.
            
        Returns:
            VoiceSampleDTO object or None if mapping fails.
        """
        try:
            sample_id = getattr(sample_data, 'sample_id', None)
            file_name = getattr(sample_data, 'file_name', '') or ''
            
            if not sample_id:
                return None
            
            # Use file_name as text, fallback to generic text
            text = file_name if file_name else f"Sample {sample_id}"
            
            # Construct audio URL based on ElevenLabs API pattern
            audio_url = f"https://api.elevenlabs.io/v1/voices/{voice_id}/samples/{sample_id}/audio"
            
            return VoiceSampleDTO(
                id=sample_id,
                text=text,
                audio_url=audio_url
            )
            
        except AttributeError:
            # Log the error but don't fail the entire voice mapping
            return None 