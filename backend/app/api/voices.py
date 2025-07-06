"""
Voices API Router - Endpoints for voice management operations.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models import ListVoicesResponseDTO, VoiceDetailDTO, CreateVoiceCommand, VoiceDTO, DesignVoiceCommand, DesignVoiceResponseDTO
from app.services.voice_service import list_voices, create_elevenlabs_client, create_voice, design_voice

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


@router.post("/design", response_model=DesignVoiceResponseDTO, status_code=status.HTTP_200_OK)
async def design_voice_endpoint(command: DesignVoiceCommand) -> DesignVoiceResponseDTO:
    """
    Design a voice and return previews for user selection.
    
    Args:
        command: DesignVoiceCommand with prompt, sample_text, loudness, and creativity
        
    Returns:
        DesignVoiceResponseDTO: Voice previews with audio samples
        
    Raises:
        HTTPException:
            - 400 Bad Request: Invalid input data
            - 500 Internal Server Error: ElevenLabs API error or internal error
            - 503 Service Unavailable: Rate limit exceeded
    """
    try:
        # Call voice service to design voice
        response = design_voice(command)
        return response
        
    except ValueError as e:
        # Handle validation errors and ElevenLabs API issues
        error_message = str(e)
        if "api key" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_message
            )
        elif "rate limit" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=error_message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid input data: {error_message}"
            )
    except Exception as e:
        # Handle any other errors from ElevenLabs API
        error_message = str(e)
        
        # Determine appropriate HTTP status code based on error type
        if "timeout" in error_message.lower():
            status_code = status.HTTP_408_REQUEST_TIMEOUT
            detail = "Voice design timed out"
        elif "unauthorized" in error_message.lower() or "401" in error_message:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = "Invalid ElevenLabs API key configuration"
        elif "forbidden" in error_message.lower() or "403" in error_message:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = "ElevenLabs API access forbidden - check API key permissions"
        elif "rate limit" in error_message.lower() or "429" in error_message:
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            detail = "ElevenLabs API rate limit exceeded"
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = f"Failed to design voice: {error_message}"
        
        raise HTTPException(
            status_code=status_code,
            detail=detail
        )


@router.post("/", response_model=VoiceDTO, status_code=status.HTTP_201_CREATED)
async def create_voice_endpoint(command: CreateVoiceCommand) -> VoiceDTO:
    """
    Create a voice from a selected preview.
    
    Args:
        command: CreateVoiceCommand with voice_name, voice_description, and generated_voice_id
        
    Returns:
        VoiceDTO: Created voice with metadata
        
    Raises:
        HTTPException:
            - 400 Bad Request: Invalid input data
            - 500 Internal Server Error: ElevenLabs API error or internal error
            - 503 Service Unavailable: Rate limit exceeded
    """
    try:
        # Call voice service to create voice
        voice_dto = create_voice(command)
        return voice_dto
        
    except ValueError as e:
        # Handle validation errors and ElevenLabs API issues
        error_message = str(e)
        if "api key" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_message
            )
        elif "rate limit" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=error_message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid input data: {error_message}"
            )
    except Exception as e:
        # Handle any other errors from ElevenLabs API
        error_message = str(e)
        
        # Determine appropriate HTTP status code based on error type
        if "timeout" in error_message.lower():
            status_code = status.HTTP_408_REQUEST_TIMEOUT
            detail = "Voice creation timed out"
        elif "unauthorized" in error_message.lower() or "401" in error_message:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = "Invalid ElevenLabs API key configuration"
        elif "forbidden" in error_message.lower() or "403" in error_message:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = "ElevenLabs API access forbidden - check API key permissions"
        elif "rate limit" in error_message.lower() or "429" in error_message:
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            detail = "ElevenLabs API rate limit exceeded"
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            detail = f"Failed to create voice: {error_message}"
        
        raise HTTPException(
            status_code=status_code,
            detail=detail
        ) 