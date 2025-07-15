import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import type { VoiceChannelDTO, ConnectBotCommand } from '../../types';

interface ChannelControlProps {
  channels: VoiceChannelDTO[];
  isLoadingChannels: boolean;
  channelsError: string | null;
  isConnected: boolean;
  currentChannelId?: string;
  isConnecting: boolean;
  isDisconnecting: boolean;
  connectionError: string | null;
  onConnect: (command: ConnectBotCommand) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export default function ChannelControl({
  channels,
  isLoadingChannels,
  channelsError,
  isConnected,
  currentChannelId,
  isConnecting,
  isDisconnecting,
  connectionError,
  onConnect,
  onDisconnect
}: ChannelControlProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  const getCurrentChannelName = () => {
    if (!isConnected || !currentChannelId) return null;
    const channel = channels.find(ch => ch.id === currentChannelId);
    return channel ? channel.name : 'Nieznany kanał';
  };

  const handleConnect = async () => {
    if (!selectedChannelId) return;
    
    try {
      await onConnect({ channelId: selectedChannelId });
      // Clear selection after successful connection
      setSelectedChannelId('');
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
    } catch {
      // Error handling is done in the parent component
    }
  };

  const isActionDisabled = isConnecting || isDisconnecting || isLoadingChannels;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-blue-500" />
          Kontrola Kanału
        </CardTitle>
        <CardDescription>
          Wybierz kanał głosowy i zarządzaj połączeniem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Voice Channel Status */}
          {currentChannelId && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800">
                Połączony z kanałem: <strong>{getCurrentChannelName()}</strong>
              </span>
            </div>
          )}

          {/* Channel Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={selectedChannelId}
                onValueChange={setSelectedChannelId}
                disabled={isActionDisabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue 
                    placeholder={
                      currentChannelId && getCurrentChannelName() 
                        ? `Aktualny: ${getCurrentChannelName()}` 
                        : "Wybierz kanał głosowy..."
                    } 
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Connection Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleConnect}
              disabled={isActionDisabled || !selectedChannelId}
              className="flex items-center gap-2"
            >
              {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
              Połącz
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDisconnect}
              disabled={isActionDisabled}
              className="flex items-center gap-2"
            >
              {isDisconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
              <VolumeX className="h-4 w-4" />
              Rozłącz
            </Button>
          </div>

          {/* Error Messages */}
          {channelsError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              Błąd ładowania kanałów: {channelsError}
            </div>
          )}
          
          {connectionError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              Błąd połączenia: {connectionError}
            </div>
          )}

          {/* Loading State */}
          {isLoadingChannels && (
            <div className="text-sm text-gray-500">
              Ładowanie kanałów głosowych...
            </div>
          )}

          {/* Empty State */}
          {!isLoadingChannels && channels.length === 0 && !channelsError && (
            <div className="text-sm text-gray-500">
              Brak dostępnych kanałów głosowych
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 