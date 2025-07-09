"""
Discord Bot API Router - Endpoints for Discord bot operations.
"""

from fastapi import APIRouter, HTTPException, status
import logging

from app.models import DiscordBotStatusDTO
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