"""
Voices API Router - Endpoints for voice management operations.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models import ListVoicesResponseDTO, VoiceDetailDTO
from app.services.voice_service import list_voices, create_elevenlabs_client

router = APIRouter(prefix="/voices", tags=["voices"])


@router.get("/", response_model=ListVoicesResponseDTO)
async def get_voices() -> ListVoicesResponseDTO:
    """
    Retrieve all available voices from ElevenLabs API.
    
    Returns:
        ListVoicesResponseDTO: Response containing list of voices with samples.
        
    Raises:
        HTTPException: 
            - 500 Internal Server Error: If ElevenLabs API request fails
            - 502 Bad Gateway: If ElevenLabs API returns invalid response
            - 503 Service Unavailable: If ElevenLabs API is temporarily unavailable
    """
    try:
        # Create ElevenLabs client
        client = create_elevenlabs_client()
        
        # Retrieve voices from ElevenLabs API
        voices = list_voices(client)
        
        # Return response
        return ListVoicesResponseDTO(items=voices)
        
    except ValueError as e:
        # Handle configuration errors (missing API key, invalid response format)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Configuration error: {str(e)}"
        )
    except Exception as e:
        # Handle any other errors from ElevenLabs API
        error_message = str(e)
        
        # Determine appropriate HTTP status code based on error type
        if "timeout" in error_message.lower():
            status_code = status.HTTP_504_GATEWAY_TIMEOUT
            detail = "ElevenLabs API request timed out"
        elif "network" in error_message.lower() or "connection" in error_message.lower():
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            detail = "ElevenLabs API is temporarily unavailable"
        elif "unauthorized" in error_message.lower() or "401" in error_message:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = "Invalid ElevenLabs API key configuration"
        elif "forbidden" in error_message.lower() or "403" in error_message:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = "ElevenLabs API access forbidden - check API key permissions"
        elif "not found" in error_message.lower() or "404" in error_message:
            status_code = status.HTTP_502_BAD_GATEWAY
            detail = "ElevenLabs API endpoint not found"
        elif "rate limit" in error_message.lower() or "429" in error_message:
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            detail = "ElevenLabs API rate limit exceeded"
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = f"Failed to retrieve voices: {error_message}"
        
        raise HTTPException(
            status_code=status_code,
            detail=detail
        ) 