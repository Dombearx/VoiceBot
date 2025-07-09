"""
Discord Bot Service - Business logic for Discord bot operations.
"""

import asyncio
import logging
from typing import Optional
import discord
from discord.ext import commands

from app.models import DiscordBotStatusDTO

# Configure logging
logger = logging.getLogger(__name__)


class DiscordBotManager:
    """
    Manager class for Discord bot operations.
    """
    
    def __init__(self):
        self._client: Optional[discord.Client] = None
        self._is_initializing = False
    
    @property
    def client(self) -> Optional[discord.Client]:
        """Get the Discord client instance."""
        return self._client
    
    async def initialize(self, token: str) -> discord.Client:
        """
        Initialize and start the Discord bot.
        
        Args:
            token: Discord bot token
            
        Returns:
            Discord client instance
            
        Raises:
            Exception: If bot initialization fails
        """
        if self._is_initializing:
            raise Exception("Discord bot is already being initialized")
        
        if self._client and not self._client.is_closed():
            logger.info("Discord bot already initialized")
            return self._client
        
        try:
            self._is_initializing = True
            
            # Create Discord client with necessary intents
            intents = discord.Intents.default()
            intents.voice_states = True
            intents.guilds = True
            
            client = discord.Client(intents=intents)
            
            @client.event
            async def on_ready():
                logger.info(f"Discord bot logged in as {client.user}")
            
            @client.event
            async def on_error(event, *args, **kwargs):
                logger.error(f"Discord bot error in {event}: {args}, {kwargs}")
            
            self._client = client
            
            # Start the bot in a background task
            asyncio.create_task(client.start(token))
            
            return client
            
        except Exception as e:
            logger.error(f"Failed to initialize Discord bot: {str(e)}")
            raise Exception(f"Discord bot initialization failed: {str(e)}") from e
        finally:
            self._is_initializing = False
    
    async def shutdown(self) -> None:
        """
        Shutdown the Discord bot gracefully.
        """
        try:
            if self._client and not self._client.is_closed():
                await self._client.close()
                logger.info("Discord bot shut down successfully")
        except Exception as e:
            logger.error(f"Error shutting down Discord bot: {str(e)}")
        finally:
            self._client = None
    
    async def get_status(self) -> DiscordBotStatusDTO:
        """
        Get the current status of the Discord bot.
        
        Returns:
            DiscordBotStatusDTO with connection status and current voice channel ID
            
        Raises:
            Exception: If there's an error checking bot status
        """
        try:
            if not self._client:
                logger.info("Discord client not initialized")
                return DiscordBotStatusDTO(connected=False, channel_id=None)
            
            # Check if bot is connected to Discord
            if not self._client.is_ready():
                logger.info("Discord client not ready")
                return DiscordBotStatusDTO(connected=False, channel_id=None)
            
            # Check if bot is connected to any voice channel
            voice_channel_id = None
            if self._client.voice_clients:
                # Get the first voice client (assuming single server usage)
                voice_client = self._client.voice_clients[0]
                if voice_client.is_connected():
                    voice_channel_id = str(voice_client.channel.id)
            
            return DiscordBotStatusDTO(
                connected=True,
                channel_id=voice_channel_id
            )
            
        except Exception as e:
            logger.error(f"Error getting Discord bot status: {str(e)}")
            raise Exception(f"Failed to get Discord bot status: {str(e)}") from e


# Global instance of the Discord bot manager
discord_bot_manager = DiscordBotManager()


def get_discord_bot_manager() -> DiscordBotManager:
    """
    Get the Discord bot manager instance.
    
    Returns:
        DiscordBotManager instance
    """
    return discord_bot_manager


async def get_status() -> DiscordBotStatusDTO:
    """
    Get the current status of the Discord bot.
    
    Returns:
        DiscordBotStatusDTO with connection status and current voice channel ID
        
    Raises:
        Exception: If there's an error checking bot status
    """
    manager = get_discord_bot_manager()
    return await manager.get_status() 