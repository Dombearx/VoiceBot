"""
Unit tests for Discord Bot Service.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from app.services.discord_bot_service import DiscordBotManager, get_discord_bot_manager, get_status
from app.models import DiscordBotStatusDTO, VoiceChannelDTO, BotConfigResponseDTO


class TestDiscordBotManager:
    """Test cases for DiscordBotManager class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.manager = DiscordBotManager()
    
    @pytest.mark.asyncio
    async def test_get_status_no_client(self):
        """Test get_status when no Discord client is initialized."""
        result = await self.manager.get_status()
        
        assert isinstance(result, DiscordBotStatusDTO)
        assert result.connected is False
        assert result.channel_id is None
    
    @pytest.mark.asyncio
    async def test_get_status_client_not_ready(self):
        """Test get_status when Discord client is not ready."""
        # Mock Discord client that is not ready
        mock_client = Mock()
        mock_client.is_ready.return_value = False
        mock_client.is_closed.return_value = False
        
        self.manager._client = mock_client
        
        result = await self.manager.get_status()
        
        assert isinstance(result, DiscordBotStatusDTO)
        assert result.connected is False
        assert result.channel_id is None
    
    @pytest.mark.asyncio
    async def test_get_status_connected_no_voice_channel(self):
        """Test get_status when bot is connected but not in voice channel."""
        # Mock Discord client that is ready but not in voice channel
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.is_closed.return_value = False
        mock_client.voice_clients = []
        
        self.manager._client = mock_client
        
        result = await self.manager.get_status()
        
        assert isinstance(result, DiscordBotStatusDTO)
        assert result.connected is True
        assert result.channel_id is None
    
    @pytest.mark.asyncio
    async def test_get_status_connected_with_voice_channel(self):
        """Test get_status when bot is connected and in voice channel."""
        # Mock voice channel and voice client
        mock_channel = Mock()
        mock_channel.id = 123456789
        
        mock_voice_client = Mock()
        mock_voice_client.is_connected.return_value = True
        mock_voice_client.channel = mock_channel
        
        # Mock Discord client that is ready and in voice channel
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.is_closed.return_value = False
        mock_client.voice_clients = [mock_voice_client]
        
        self.manager._client = mock_client
        
        result = await self.manager.get_status()
        
        assert isinstance(result, DiscordBotStatusDTO)
        assert result.connected is True
        assert result.channel_id == "123456789"
    
    @pytest.mark.asyncio
    async def test_get_status_connected_voice_client_disconnected(self):
        """Test get_status when bot has voice client but it's disconnected."""
        # Mock voice client that is disconnected
        mock_voice_client = Mock()
        mock_voice_client.is_connected.return_value = False
        
        # Mock Discord client that is ready but voice client is disconnected
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.is_closed.return_value = False
        mock_client.voice_clients = [mock_voice_client]
        
        self.manager._client = mock_client
        
        result = await self.manager.get_status()
        
        assert isinstance(result, DiscordBotStatusDTO)
        assert result.connected is True
        assert result.channel_id is None
    
    @pytest.mark.asyncio
    async def test_get_status_exception_handling(self):
        """Test get_status exception handling."""
        # Mock Discord client that raises exception
        mock_client = Mock()
        mock_client.is_ready.side_effect = Exception("Connection error")
        mock_client.is_closed.return_value = False
        
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Failed to get Discord bot status"):
            await self.manager.get_status()
    
    @pytest.mark.asyncio
    @patch('app.services.discord_bot_service.discord.Client')
    @patch('app.services.discord_bot_service.asyncio.create_task')
    async def test_initialize_success(self, mock_create_task, mock_discord_client):
        """Test successful Discord bot initialization."""
        mock_client = Mock()
        mock_discord_client.return_value = mock_client
        mock_client.is_closed.return_value = False
        
        token = "test_token"
        result = await self.manager.initialize(token)
        
        assert result == mock_client
        assert self.manager._client == mock_client
        mock_create_task.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_initialize_already_initialized(self):
        """Test initialization when bot is already initialized."""
        # Mock already initialized client
        mock_client = Mock()
        mock_client.is_closed.return_value = False
        self.manager._client = mock_client
        
        token = "test_token"
        result = await self.manager.initialize(token)
        
        assert result == mock_client
        assert self.manager._client == mock_client
    
    @pytest.mark.asyncio
    async def test_initialize_already_initializing(self):
        """Test initialization when bot is already being initialized."""
        self.manager._is_initializing = True
        
        token = "test_token"
        with pytest.raises(Exception, match="Discord bot is already being initialized"):
            await self.manager.initialize(token)
    
    @pytest.mark.asyncio
    @patch('app.services.discord_bot_service.discord.Client')
    async def test_initialize_exception_handling(self, mock_discord_client):
        """Test initialization exception handling."""
        mock_discord_client.side_effect = Exception("Initialization failed")
        
        token = "test_token"
        with pytest.raises(Exception, match="Discord bot initialization failed"):
            await self.manager.initialize(token)
        
        assert self.manager._is_initializing is False
    
    @pytest.mark.asyncio
    async def test_shutdown_success(self):
        """Test successful Discord bot shutdown."""
        mock_client = AsyncMock()
        mock_client.is_closed = Mock(return_value=False)  # Synchronous mock
        self.manager._client = mock_client
        
        await self.manager.shutdown()
        
        mock_client.close.assert_called_once()
        assert self.manager._client is None
    
    @pytest.mark.asyncio
    async def test_shutdown_no_client(self):
        """Test shutdown when no client is initialized."""
        await self.manager.shutdown()
        # Should not raise exception
        assert self.manager._client is None
    
    @pytest.mark.asyncio
    async def test_shutdown_client_already_closed(self):
        """Test shutdown when client is already closed."""
        mock_client = AsyncMock()
        mock_client.is_closed = Mock(return_value=True)  # Synchronous mock
        self.manager._client = mock_client
        
        await self.manager.shutdown()
        
        mock_client.close.assert_not_called()
        assert self.manager._client is None

    # New tests for list_channels method
    @pytest.mark.asyncio
    async def test_list_channels_no_client(self):
        """Test list_channels when no Discord client is initialized."""
        with pytest.raises(Exception, match="Discord bot not initialized"):
            await self.manager.list_channels()
    
    @pytest.mark.asyncio
    async def test_list_channels_client_not_ready(self):
        """Test list_channels when Discord client is not ready."""
        mock_client = Mock()
        mock_client.is_ready.return_value = False
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Discord bot not ready"):
            await self.manager.list_channels()
    
    @pytest.mark.asyncio
    async def test_list_channels_success(self):
        """Test successful listing of voice channels."""
        # Mock voice channels
        mock_channel1 = Mock()
        mock_channel1.id = 123456789
        mock_channel1.name = "General"
        mock_channel1.permissions_for.return_value.connect = True
        
        mock_channel2 = Mock()
        mock_channel2.id = 987654321
        mock_channel2.name = "Music"
        mock_channel2.permissions_for.return_value.connect = True
        
        # Mock guild
        mock_guild = Mock()
        mock_guild.name = "Test Server"
        mock_guild.voice_channels = [mock_channel1, mock_channel2]
        mock_guild.me = Mock()
        
        # Mock Discord client
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.guilds = [mock_guild]
        
        self.manager._client = mock_client
        
        result = await self.manager.list_channels()
        
        assert len(result) == 2
        assert isinstance(result[0], VoiceChannelDTO)
        assert result[0].id == "123456789"
        assert result[0].name == "Test Server - General"
        assert result[1].id == "987654321"
        assert result[1].name == "Test Server - Music"
    
    @pytest.mark.asyncio
    async def test_list_channels_no_permission(self):
        """Test list_channels filters out channels without connect permission."""
        # Mock voice channel without connect permission
        mock_channel = Mock()
        mock_channel.id = 123456789
        mock_channel.name = "Private"
        mock_channel.permissions_for.return_value.connect = False
        
        # Mock guild
        mock_guild = Mock()
        mock_guild.name = "Test Server"
        mock_guild.voice_channels = [mock_channel]
        mock_guild.me = Mock()
        
        # Mock Discord client
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.guilds = [mock_guild]
        
        self.manager._client = mock_client
        
        result = await self.manager.list_channels()
        
        assert len(result) == 0
    
    @pytest.mark.asyncio
    async def test_list_channels_exception_handling(self):
        """Test list_channels exception handling."""
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.guilds = Mock(side_effect=Exception("Guild access error"))
        
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Failed to list voice channels"):
            await self.manager.list_channels()

    # New tests for connect method
    @pytest.mark.asyncio
    async def test_connect_no_client(self):
        """Test connect when no Discord client is initialized."""
        with pytest.raises(Exception, match="Discord bot not initialized"):
            await self.manager.connect("123456789")
    
    @pytest.mark.asyncio
    async def test_connect_client_not_ready(self):
        """Test connect when Discord client is not ready."""
        mock_client = Mock()
        mock_client.is_ready.return_value = False
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Discord bot not ready"):
            await self.manager.connect("123456789")
    
    @pytest.mark.asyncio
    async def test_connect_channel_not_found(self):
        """Test connect when channel is not found."""
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.get_channel.return_value = None
        
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Voice channel with ID 123456789 not found"):
            await self.manager.connect("123456789")
    
    @pytest.mark.asyncio
    async def test_connect_not_voice_channel(self):
        """Test connect when channel is not a voice channel."""
        mock_channel = Mock()
        mock_channel.id = 123456789
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.get_channel.return_value = mock_channel
        
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Channel 123456789 is not a voice channel"):
            await self.manager.connect("123456789")
    
    @pytest.mark.asyncio
    async def test_connect_no_permission(self):
        """Test connect when bot has no permission to connect."""
        from discord import VoiceChannel
        
        mock_channel = Mock(spec=VoiceChannel)
        mock_channel.id = 123456789
        mock_channel.name = "Test Channel"
        mock_channel.permissions_for.return_value.connect = False
        mock_channel.guild.me = Mock()
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.get_channel.return_value = mock_channel
        
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Bot does not have permission to connect"):
            await self.manager.connect("123456789")
    
    @pytest.mark.asyncio
    async def test_connect_success(self):
        """Test successful connection to voice channel."""
        from discord import VoiceChannel
        
        mock_channel = Mock(spec=VoiceChannel)
        mock_channel.id = 123456789
        mock_channel.name = "Test Channel"
        mock_channel.permissions_for.return_value.connect = True
        mock_channel.guild.me = Mock()
        
        mock_voice_client = AsyncMock()
        mock_voice_client.is_connected.return_value = True
        mock_channel.connect = AsyncMock(return_value=mock_voice_client)
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.get_channel.return_value = mock_channel
        mock_client.voice_clients = []
        
        self.manager._client = mock_client
        
        result = await self.manager.connect("123456789")
        
        assert isinstance(result, DiscordBotStatusDTO)
        assert result.connected is True
        assert result.channel_id == "123456789"
        mock_channel.connect.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_connect_disconnect_previous(self):
        """Test connect disconnects from previous voice channel."""
        from discord import VoiceChannel
        
        # Mock previous voice client
        mock_prev_voice_client = AsyncMock()
        mock_prev_voice_client.is_connected.return_value = True
        mock_prev_voice_client.disconnect = AsyncMock()
        
        # Mock new channel
        mock_channel = Mock(spec=VoiceChannel)
        mock_channel.id = 123456789
        mock_channel.name = "Test Channel"
        mock_channel.permissions_for.return_value.connect = True
        mock_channel.guild.me = Mock()
        
        mock_voice_client = AsyncMock()
        mock_voice_client.is_connected.return_value = True
        mock_channel.connect = AsyncMock(return_value=mock_voice_client)
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.get_channel.return_value = mock_channel
        mock_client.voice_clients = [mock_prev_voice_client]
        
        self.manager._client = mock_client
        
        result = await self.manager.connect("123456789")
        
        mock_prev_voice_client.disconnect.assert_called_once()
        assert result.connected is True
        assert result.channel_id == "123456789"
    
    @pytest.mark.asyncio
    async def test_connect_invalid_channel_id(self):
        """Test connect with invalid channel ID."""
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.get_channel.side_effect = ValueError("Invalid ID")
        
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Invalid channel ID"):
            await self.manager.connect("invalid_id")

    # New tests for disconnect method
    @pytest.mark.asyncio
    async def test_disconnect_no_client(self):
        """Test disconnect when no Discord client is initialized."""
        with pytest.raises(Exception, match="Discord bot not initialized"):
            await self.manager.disconnect()
    
    @pytest.mark.asyncio
    async def test_disconnect_client_not_ready(self):
        """Test disconnect when Discord client is not ready."""
        mock_client = Mock()
        mock_client.is_ready.return_value = False
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Discord bot not ready"):
            await self.manager.disconnect()
    
    @pytest.mark.asyncio
    async def test_disconnect_no_voice_clients(self):
        """Test disconnect when no voice clients are connected."""
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.voice_clients = []
        
        self.manager._client = mock_client
        
        result = await self.manager.disconnect()
        
        assert isinstance(result, DiscordBotStatusDTO)
        assert result.connected is False
        assert result.channel_id is None
    
    @pytest.mark.asyncio
    async def test_disconnect_success(self):
        """Test successful disconnect from voice channel."""
        mock_voice_client = AsyncMock()
        mock_voice_client.is_connected.return_value = True
        mock_voice_client.channel.name = "Test Channel"
        mock_voice_client.disconnect = AsyncMock()
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.voice_clients = [mock_voice_client]
        
        self.manager._client = mock_client
        
        result = await self.manager.disconnect()
        
        mock_voice_client.disconnect.assert_called_once()
        assert isinstance(result, DiscordBotStatusDTO)
        assert result.connected is False
        assert result.channel_id is None
    
    @pytest.mark.asyncio
    async def test_disconnect_exception_handling(self):
        """Test disconnect exception handling."""
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.voice_clients = Mock(side_effect=Exception("Disconnect error"))
        
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Failed to disconnect from voice channel"):
            await self.manager.disconnect()

    # New tests for update_config method
    @pytest.mark.asyncio
    async def test_update_config_no_client(self):
        """Test update_config when no Discord client is initialized."""
        with pytest.raises(Exception, match="Discord bot not initialized"):
            await self.manager.update_config("TestBot")
    
    @pytest.mark.asyncio
    async def test_update_config_client_not_ready(self):
        """Test update_config when Discord client is not ready."""
        mock_client = Mock()
        mock_client.is_ready.return_value = False
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Discord bot not ready"):
            await self.manager.update_config("TestBot")
    
    @pytest.mark.asyncio
    async def test_update_config_invalid_name_empty(self):
        """Test update_config with empty nickname."""
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        self.manager._client = mock_client
        
        with pytest.raises(Exception, match="Bot nickname must be between 1 and 32 characters"):
            await self.manager.update_config("")
    
    @pytest.mark.asyncio
    async def test_update_config_invalid_name_too_long(self):
        """Test update_config with nickname too long."""
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        self.manager._client = mock_client
        
        long_name = "a" * 33
        with pytest.raises(Exception, match="Bot nickname must be between 1 and 32 characters"):
            await self.manager.update_config(long_name)
    
    @pytest.mark.asyncio
    async def test_update_config_avatar_too_large(self):
        """Test update_config with avatar file too large."""
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        self.manager._client = mock_client
        
        large_avatar = b"x" * (3 * 1024 * 1024)  # 3MB
        with pytest.raises(Exception, match="Avatar file size must not exceed 2MB"):
            await self.manager.update_config("TestBot", large_avatar)
    
    @pytest.mark.asyncio
    async def test_update_config_success_name_only(self):
        """Test successful config update with nickname only."""
        mock_user = Mock()
        mock_user.edit = AsyncMock()
        mock_user.avatar = None
        
        mock_guild = Mock()
        mock_guild.name = "TestServer"
        mock_guild.me.guild_permissions.change_nickname = True
        mock_guild.me.edit = AsyncMock()
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.user = mock_user
        mock_client.guilds = [mock_guild]
        
        self.manager._client = mock_client
        
        result = await self.manager.update_config("TestBot")
        
        mock_guild.me.edit.assert_called_once_with(nick="TestBot")
        assert isinstance(result, BotConfigResponseDTO)
        assert result.nickname == "TestBot"
        assert result.avatar_url == ""
    
    @pytest.mark.asyncio
    async def test_update_config_success_with_avatar(self):
        """Test successful config update with nickname and avatar."""
        mock_avatar = Mock()
        mock_avatar.url = "https://cdn.discordapp.com/avatars/123/avatar.png"
        
        mock_user = Mock()
        mock_user.edit = AsyncMock()
        mock_user.avatar = mock_avatar
        
        mock_guild = Mock()
        mock_guild.name = "TestServer"
        mock_guild.me.guild_permissions.change_nickname = True
        mock_guild.me.edit = AsyncMock()
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.user = mock_user
        mock_client.guilds = [mock_guild]
        
        self.manager._client = mock_client
        
        avatar_bytes = b"fake_image_data"
        result = await self.manager.update_config("TestBot", avatar_bytes)
        
        mock_user.edit.assert_called_once_with(avatar=avatar_bytes)
        mock_guild.me.edit.assert_called_once_with(nick="TestBot")
        assert isinstance(result, BotConfigResponseDTO)
        assert result.nickname == "TestBot"
        assert result.avatar_url == "https://cdn.discordapp.com/avatars/123/avatar.png"
    
    @pytest.mark.asyncio
    async def test_update_config_discord_http_exception(self):
        """Test update_config with Discord HTTP exception."""
        import discord
        
        mock_user = Mock()
        mock_user.edit = AsyncMock()
        mock_user.avatar = None
        
        mock_guild = Mock()
        mock_guild.name = "TestServer"
        mock_guild.me.guild_permissions.change_nickname = True
        mock_guild.me.edit = AsyncMock(side_effect=discord.HTTPException(
            response=Mock(status=400), 
            message="Bad Request"
        ))
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.user = mock_user
        mock_client.guilds = [mock_guild]
        
        self.manager._client = mock_client
        
        # Should not raise exception - it continues after guild errors
        result = await self.manager.update_config("TestBot")
        assert isinstance(result, BotConfigResponseDTO)
        assert result.nickname == "TestBot"
    
    @pytest.mark.asyncio
    async def test_update_config_rate_limit(self):
        """Test update_config with rate limit exception for avatar update."""
        import discord
        
        mock_user = Mock()
        mock_user.edit = AsyncMock(side_effect=discord.HTTPException(
            response=Mock(status=429), 
            message="Too Many Requests"
        ))
        
        mock_client = Mock()
        mock_client.is_ready.return_value = True
        mock_client.user = mock_user
        mock_client.guilds = []
        
        self.manager._client = mock_client
        
        avatar_bytes = b"fake_image_data"
        with pytest.raises(Exception, match="Rate limited"):
            await self.manager.update_config("TestBot", avatar_bytes)


class TestServiceFunctions:
    """Test cases for service-level functions."""
    
    def test_get_discord_bot_manager(self):
        """Test get_discord_bot_manager returns manager instance."""
        manager = get_discord_bot_manager()
        assert isinstance(manager, DiscordBotManager)
    
    @pytest.mark.asyncio
    @patch('app.services.discord_bot_service.get_discord_bot_manager')
    async def test_get_status_function(self, mock_get_manager):
        """Test get_status function calls manager's get_status method."""
        mock_manager = Mock()
        mock_status = DiscordBotStatusDTO(connected=True, channel_id="123")
        mock_manager.get_status = AsyncMock(return_value=mock_status)
        mock_get_manager.return_value = mock_manager
        
        result = await get_status()
        
        assert result == mock_status
        mock_manager.get_status.assert_called_once() 