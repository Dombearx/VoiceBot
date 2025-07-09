"""
Discord Bot Service - Business logic for Discord bot operations.
"""

import asyncio
import logging
from typing import Optional
import discord
from discord.ext import commands

from app.models import DiscordBotStatusDTO, VoiceChannelDTO, BotConfigResponseDTO

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

    async def list_channels(self) -> list[VoiceChannelDTO]:
        """
        List all available voice channels across all guilds.
        
        Returns:
            List of VoiceChannelDTO objects containing channel information
            
        Raises:
            Exception: If bot is not initialized or not ready
        """
        try:
            if not self._client:
                raise Exception("Discord bot not initialized")
            
            if not self._client.is_ready():
                raise Exception("Discord bot not ready")
            
            channels = []
            
            # Iterate through all guilds the bot is connected to
            for guild in self._client.guilds:
                # Get all voice channels in the guild
                for channel in guild.voice_channels:
                    # Check if bot has permission to connect to the channel
                    if channel.permissions_for(guild.me).connect:
                        channels.append(VoiceChannelDTO(
                            id=str(channel.id),
                            name=f"{guild.name} - {channel.name}"
                        ))
            
            logger.info(f"Found {len(channels)} available voice channels")
            return channels
            
        except Exception as e:
            logger.error(f"Error listing voice channels: {str(e)}")
            raise Exception(f"Failed to list voice channels: {str(e)}") from e

    async def connect(self, channel_id: str) -> DiscordBotStatusDTO:
        """
        Connect the bot to a specified voice channel.
        
        Args:
            channel_id: ID of the voice channel to connect to
            
        Returns:
            DiscordBotStatusDTO with connection status
            
        Raises:
            Exception: If bot is not initialized, channel not found, or connection fails
        """
        try:
            if not self._client:
                raise Exception("Discord bot not initialized")
            
            if not self._client.is_ready():
                raise Exception("Discord bot not ready")
            
            # Find the voice channel by ID
            channel = self._client.get_channel(int(channel_id))
            
            if not channel:
                raise Exception(f"Voice channel with ID {channel_id} not found")
            
            if not isinstance(channel, discord.VoiceChannel):
                raise Exception(f"Channel {channel_id} is not a voice channel")
            
            # Check if bot has permission to connect
            if not channel.permissions_for(channel.guild.me).connect:
                raise Exception(f"Bot does not have permission to connect to channel {channel.name}")
            
            # Disconnect from current voice channel if connected
            if self._client.voice_clients:
                for voice_client in self._client.voice_clients:
                    if voice_client.is_connected():
                        await voice_client.disconnect()
                        logger.info(f"Disconnected from previous voice channel")
            
            # Connect to the new voice channel
            voice_client = await channel.connect()
            
            if voice_client.is_connected():
                logger.info(f"Successfully connected to voice channel: {channel.name}")
                return DiscordBotStatusDTO(connected=True, channel_id=channel_id)
            else:
                raise Exception("Failed to establish voice connection")
                
        except ValueError:
            raise Exception(f"Invalid channel ID: {channel_id}")
        except Exception as e:
            logger.error(f"Error connecting to voice channel {channel_id}: {str(e)}")
            raise Exception(f"Failed to connect to voice channel: {str(e)}") from e

    async def disconnect(self) -> DiscordBotStatusDTO:
        """
        Disconnect the bot from the current voice channel.
        
        Returns:
            DiscordBotStatusDTO with disconnected status
            
        Raises:
            Exception: If bot is not initialized or disconnection fails
        """
        try:
            if not self._client:
                raise Exception("Discord bot not initialized")
            
            if not self._client.is_ready():
                raise Exception("Discord bot not ready")
            
            # Disconnect from all voice channels
            disconnected_any = False
            if self._client.voice_clients:
                for voice_client in self._client.voice_clients:
                    if voice_client.is_connected():
                        await voice_client.disconnect()
                        disconnected_any = True
                        logger.info(f"Disconnected from voice channel: {voice_client.channel.name}")
            
            if not disconnected_any:
                logger.info("Bot was not connected to any voice channel")
            
            return DiscordBotStatusDTO(connected=False, channel_id=None)
            
        except Exception as e:
            logger.error(f"Error disconnecting from voice channel: {str(e)}")
            raise Exception(f"Failed to disconnect from voice channel: {str(e)}") from e

    async def update_config(self, nickname: str, avatar_bytes: Optional[bytes] = None) -> BotConfigResponseDTO:
        """
        Update bot configuration (server nickname and avatar).
        
        Args:
            nickname: New bot nickname for all servers (1-32 characters)
            avatar_bytes: Optional avatar image bytes (jpg/png, max 2MB)
            
        Returns:
            BotConfigResponseDTO with updated configuration
            
        Raises:
            Exception: If bot is not initialized or update fails
        """
        try:
            if not self._client:
                raise Exception("Discord bot not initialized")
            
            if not self._client.is_ready():
                raise Exception("Discord bot not ready")
            
            # Validate nickname length (Discord limit is 32 characters for nicknames)
            if not nickname or len(nickname) < 1 or len(nickname) > 32:
                raise Exception("Bot nickname must be between 1 and 32 characters")
            
            # Validate avatar size if provided
            if avatar_bytes and len(avatar_bytes) > 2 * 1024 * 1024:  # 2MB limit
                raise Exception("Avatar file size must not exceed 2MB")
            
            # Update avatar if provided
            if avatar_bytes:
                await self._client.user.edit(avatar=avatar_bytes)
            
            # Update nickname on all servers
            updated_guilds = []
            for guild in self._client.guilds:
                try:
                    # Check if bot has permission to change nickname
                    if guild.me.guild_permissions.change_nickname:
                        await guild.me.edit(nick=nickname)
                        updated_guilds.append(guild.name)
                        logger.info(f"Updated nickname to '{nickname}' on server: {guild.name}")
                    else:
                        logger.warning(f"No permission to change nickname on server: {guild.name}")
                except discord.HTTPException as e:
                    logger.warning(f"Failed to update nickname on server {guild.name}: {str(e)}")
                    continue
            
            # Get the updated avatar URL
            avatar_url = str(self._client.user.avatar.url) if self._client.user.avatar else ""
            
            if updated_guilds:
                logger.info(f"Successfully updated bot nickname to '{nickname}' on {len(updated_guilds)} servers, avatar_updated={avatar_bytes is not None}")
            else:
                logger.warning("No servers were updated (permission issues)")
            
            return BotConfigResponseDTO(
                nickname=nickname,
                avatar_url=avatar_url
            )
            
        except discord.HTTPException as e:
            if e.status == 400:
                raise Exception(f"Invalid bot configuration: {str(e)}")
            elif e.status == 429:
                raise Exception("Rate limited. Please try again later")
            else:
                raise Exception(f"Discord API error: {str(e)}")
        except Exception as e:
            logger.error(f"Error updating bot configuration: {str(e)}")
            raise Exception(f"Failed to update bot configuration: {str(e)}") from e


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