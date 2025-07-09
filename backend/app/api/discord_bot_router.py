"""
Discord Bot API Router - Endpoints for Discord bot operations.
"""

from fastapi import APIRouter, HTTPException, status, File, UploadFile, Form
import logging

from app.models import (
    DiscordBotStatusDTO, 
    VoiceChannelDTO, 
    ConnectBotCommand, 
    BotConfigResponseDTO
)
from app.services import discord_bot_service

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/discord-bot", tags=["discord-bot"])


@router.get("/status", response_model=DiscordBotStatusDTO)
async def get_status() -> DiscordBotStatusDTO:
    """
    Get the current status of the Discord bot.
    
    Returns:
        DiscordBotStatusDTO: Current connection status and voice channel ID
        
    Raises:
        HTTPException:
            - 500 Internal Server Error: If there's an error checking bot status
    """
    try:
        status_dto = await discord_bot_service.get_status()
        logger.info(f"Discord bot status retrieved: connected={status_dto.connected}, channel_id={status_dto.channel_id}")
        return status_dto
        
    except Exception as e:
        logger.error(f"Failed to get Discord bot status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get Discord bot status: {str(e)}"
        )


@router.get("/channels", response_model=list[VoiceChannelDTO])
async def list_channels() -> list[VoiceChannelDTO]:
    """
    List all available voice channels across all guilds.
    
    Returns:
        list[VoiceChannelDTO]: List of available voice channels
        
    Raises:
        HTTPException:
            - 500 Internal Server Error: If bot is not initialized or ready
            - 503 Service Unavailable: If Discord bot is not ready
    """
    try:
        manager = discord_bot_service.get_discord_bot_manager()
        channels = await manager.list_channels()
        logger.info(f"Listed {len(channels)} available voice channels")
        return channels
        
    except Exception as e:
        logger.error(f"Failed to list voice channels: {str(e)}")
        if "not initialized" in str(e) or "not ready" in str(e):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Discord bot is not ready"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list voice channels: {str(e)}"
        )


@router.post("/connect", response_model=DiscordBotStatusDTO)
async def connect_bot(command: ConnectBotCommand) -> DiscordBotStatusDTO:
    """
    Connect the bot to a specified voice channel.
    
    Args:
        command: ConnectBotCommand with channel_id
        
    Returns:
        DiscordBotStatusDTO: Connection status after attempting to connect
        
    Raises:
        HTTPException:
            - 400 Bad Request: If channel_id is invalid or empty
            - 403 Forbidden: If bot doesn't have permission to connect
            - 404 Not Found: If channel doesn't exist
            - 500 Internal Server Error: If connection fails
            - 503 Service Unavailable: If Discord bot is not ready
    """
    try:
        # Validate channel_id
        if not command.channel_id or not command.channel_id.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Channel ID cannot be empty"
            )
        
        manager = discord_bot_service.get_discord_bot_manager()
        result = await manager.connect(command.channel_id)
        logger.info(f"Bot connected to channel {command.channel_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to connect to channel {command.channel_id}: {str(e)}")
        error_msg = str(e)
        
        if "not initialized" in error_msg or "not ready" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Discord bot is not ready"
            )
        elif "not found" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Voice channel with ID {command.channel_id} not found"
            )
        elif "permission" in error_msg or "does not have" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bot does not have permission to connect to channel"
            )
        elif "Invalid channel ID" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid channel ID: {command.channel_id}"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to connect to voice channel: {error_msg}"
            )


@router.post("/disconnect", response_model=DiscordBotStatusDTO)
async def disconnect_bot() -> DiscordBotStatusDTO:
    """
    Disconnect the bot from the current voice channel.
    
    Returns:
        DiscordBotStatusDTO: Connection status after disconnecting
        
    Raises:
        HTTPException:
            - 500 Internal Server Error: If disconnection fails
            - 503 Service Unavailable: If Discord bot is not ready
    """
    try:
        manager = discord_bot_service.get_discord_bot_manager()
        result = await manager.disconnect()
        logger.info("Bot disconnected from voice channel")
        return result
        
    except Exception as e:
        logger.error(f"Failed to disconnect bot: {str(e)}")
        error_msg = str(e)
        
        if "not initialized" in error_msg or "not ready" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Discord bot is not ready"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to disconnect from voice channel: {error_msg}"
            )


@router.patch("/config", response_model=BotConfigResponseDTO)
async def update_bot_config(
    nickname: str = Form(..., min_length=1, max_length=32),
    avatar: UploadFile = File(None)
) -> BotConfigResponseDTO:
    """
    Update bot configuration (server nickname and avatar).
    
    Args:
        nickname: New bot nickname for all servers (1-32 characters)
        avatar: Optional avatar image file (jpg/png, max 2MB)
        
    Returns:
        BotConfigResponseDTO: Updated bot configuration
        
    Raises:
        HTTPException:
            - 400 Bad Request: If validation fails
            - 500 Internal Server Error: If update fails
            - 503 Service Unavailable: If Discord bot is not ready
    """
    try:
        # Validate nickname
        if not nickname or len(nickname.strip()) < 1 or len(nickname.strip()) > 32:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bot nickname must be between 1 and 32 characters"
            )
        
        avatar_bytes = None
        if avatar:
            # Validate file type
            if not avatar.content_type or avatar.content_type not in ["image/jpeg", "image/png"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Avatar must be a JPEG or PNG image"
                )
            
            # Read avatar file
            avatar_bytes = await avatar.read()
            
            # Validate file size (2MB limit)
            if len(avatar_bytes) > 2 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Avatar file size must not exceed 2MB"
                )
        
        manager = discord_bot_service.get_discord_bot_manager()
        result = await manager.update_config(nickname.strip(), avatar_bytes)
        logger.info(f"Bot configuration updated: nickname={nickname}, avatar_updated={avatar is not None}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update bot configuration: {str(e)}")
        error_msg = str(e)
        
        if "not initialized" in error_msg or "not ready" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Discord bot is not ready"
            )
        elif "Rate limited" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limited. Please try again later"
            )
        elif "Invalid bot configuration" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update bot configuration: {error_msg}"
            ) 