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
    
    def design_voice(self, voice_description: str, loudness: float = 0.5, creativity: float = 5.0, sample_text: str = None) -> Dict[str, Any]:
        """
        Design a voice using ElevenLabs API.
        
        Args:
            voice_description: Description of the voice to create (20-1000 chars)
            loudness: Volume level (-1 to 1, default 0.5)
            creativity: Guidance scale (0-100, default 5.0)
            sample_text: Optional text to generate (100-1000 chars)
            
        Returns:
            Dict containing previews with generated_voice_id and audio samples
            
        Raises:
            Exception: If the API request fails
        """
        try:
            # Prepare request data
            request_data = {
                "voice_description": voice_description,
                # "model_id": "eleven_ttv_v3",
                "loudness": loudness,
                "guidance_scale": creativity,
                "auto_generate_text": sample_text is None
            }
            
            # Add sample text if provided
            if sample_text:
                request_data["text"] = sample_text
            
            # Call ElevenLabs design API
            response = self.client.text_to_voice.design(**request_data)
            
            return {
                "previews": response.previews,
                "text": response.text
            }
            
        except Exception as e:
            # Map ElevenLabs API errors to more specific exceptions
            error_message = str(e).lower()
            if "unauthorized" in error_message or "401" in error_message:
                raise ValueError("Invalid ElevenLabs API key") from e
            elif "forbidden" in error_message or "403" in error_message:
                raise ValueError("ElevenLabs API access forbidden - check API key permissions") from e
            elif "rate limit" in error_message or "429" in error_message:
                raise ValueError("ElevenLabs API rate limit exceeded - please try again later") from e
            elif "unprocessable entity" in error_message or "422" in error_message:
                raise ValueError("Invalid voice description or parameters") from e
            else:
                raise Exception(f"Failed to design voice: {str(e)}") from e
    
    def create_voice_from_preview(self, voice_name: str, voice_description: str, generated_voice_id: str) -> Dict[str, Any]:
        """
        Create a voice from a generated preview.
        
        Args:
            voice_name: Name for the new voice
            voice_description: Description for the new voice (20-1000 chars)
            generated_voice_id: ID from design voice preview
            
        Returns:
            Dict containing created voice data
            
        Raises:
            Exception: If the API request fails
        """
        try:
            response = self.client.text_to_voice.create(
                voice_name=voice_name,
                voice_description=voice_description,
                generated_voice_id=generated_voice_id
            )
            
            return {
                "voice_id": response.voice_id,
                "name": response.name,
                "description": response.description,
                "created_at_unix": response.created_at_unix
            }
            
        except Exception as e:
            # Map ElevenLabs API errors to more specific exceptions
            error_message = str(e).lower()
            if "unauthorized" in error_message or "401" in error_message:
                raise ValueError("Invalid ElevenLabs API key") from e
            elif "forbidden" in error_message or "403" in error_message:
                raise ValueError("ElevenLabs API access forbidden - check API key permissions") from e
            elif "rate limit" in error_message or "429" in error_message:
                raise ValueError("ElevenLabs API rate limit exceeded - please try again later") from e
            elif "unprocessable entity" in error_message or "422" in error_message:
                raise ValueError("Invalid voice data or generated_voice_id") from e
            else:
                raise Exception(f"Failed to create voice: {str(e)}") from e