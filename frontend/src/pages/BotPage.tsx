import { useEffect } from 'react';
import { toast } from 'sonner';
import { useBotStatus, useChannels, useBotConnection, useBotConfig, usePlaySpeech } from '../lib/hooks/useDiscordBot';
import { useFetchVoices } from '../lib/hooks/useVoices';
import BotStatusCard from '../components/bot/BotStatusCard';
import ChannelControl from '../components/bot/ChannelControl';
import BotConfigForm from '../components/bot/BotConfigForm';
import PlaySpeechForm from '../components/bot/PlaySpeechForm';
import type { ConnectBotCommand, BotConfigCommand, PlayCommand } from '../types';

export default function BotPage() {
  // Bot status management
  const botStatus = useBotStatus();

  // Voice channels management
  const channels = useChannels();

  // Bot connection management
  const botConnection = useBotConnection();

  // Bot configuration management
  const botConfig = useBotConfig();

  // Voices management (for speech form)
  const voices = useFetchVoices();

  // Audio playback management
  const playAudio = usePlaySpeech();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load data in parallel
        await Promise.all([
          botStatus.fetchStatus(),
          channels.fetchChannels(),
          voices.fetchVoices()
        ]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Błąd ładowania danych aplikacji');
      }
    };

    loadInitialData();
  }, []);

  // Handle bot connection
  const handleConnectBot = async (command: ConnectBotCommand) => {
    try {
      await botConnection.connectBot(command);
      await botStatus.fetchStatus();
      toast.success('Bot podłączony do kanału głosowego');
    } catch (error) {
      console.error('Failed to connect bot:', error);
      toast.error('Nie udało się podłączyć bota');
    }
  };

  // Handle bot disconnection
  const handleDisconnectBot = async () => {
    try {
      const updatedStatus = await botConnection.disconnectBot();
      botStatus.updateStatus(updatedStatus);
      toast.success('Bot odłączony od kanału głosowego');
    } catch (error) {
      console.error('Failed to disconnect bot:', error);
      toast.error('Nie udało się odłączyć bota');
    }
  };

  // Handle bot configuration update
  const handleUpdateConfig = async (command: BotConfigCommand) => {
    try {
      const response = await botConfig.updateConfig(command);
      toast.success('Konfiguracja bota zaktualizowana');
      return response;
    } catch (error) {
      console.error('Failed to update bot config:', error);
      toast.error('Nie udało się zaktualizować konfiguracji bota');
      throw error;
    }
  };

  // Handle audio playback
  const handlePlayAudio = async (command: PlayCommand) => {
    try {
      await playAudio.playAudio(command);
      toast.success('Audio odtwarzane przez bota');
    } catch (error) {
      console.error('Failed to play audio:', error);
      toast.error('Nie udało się odtworzyć audio');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bot Discord</h1>
          <p className="text-gray-600 mt-1">Konfiguruj i kontroluj bota Discord</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Bot Status */}
        <BotStatusCard
          status={botStatus.status}
          isLoading={botStatus.isLoading}
          error={botStatus.error}
          onRefresh={botStatus.refreshStatus}
        />

        {/* Channel Control */}
        <ChannelControl
          channels={channels.channels}
          isLoadingChannels={channels.isLoading}
          channelsError={channels.error}
          isConnected={botStatus.status?.connected ?? false}
          currentChannelId={botStatus.status?.channelId}
          isConnecting={botConnection.isConnecting}
          isDisconnecting={botConnection.isDisconnecting}
          connectionError={botConnection.error}
          onConnect={handleConnectBot}
          onDisconnect={handleDisconnectBot}
        />

        {/* Bot Configuration */}
        <BotConfigForm
          initialNickname="VoiceBot"
          isUpdating={botConfig.isUpdating}
          error={botConfig.error}
          onSubmit={handleUpdateConfig}
        />

        {/* Play Speech Form */}
        <PlaySpeechForm
          voices={voices.voices}
          isLoading={playAudio.isPlaying}
          error={playAudio.error}
          onPlay={handlePlayAudio}
          onCancel={playAudio.cancelPlay}
        />
      </div>
    </div>
  );
} 