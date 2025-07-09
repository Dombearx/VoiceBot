"""
Unit tests for Discord Bot Service.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from app.services.discord_bot_service import DiscordBotManager, get_discord_bot_manager, get_status
from app.models import DiscordBotStatusDTO


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