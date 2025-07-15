import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import type { DiscordBotStatusDTO } from '../../types';

interface BotStatusCardProps {
  status: DiscordBotStatusDTO | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function BotStatusCard({ status, isLoading, error, onRefresh }: BotStatusCardProps) {
  const isConnected = status?.connected ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            Status Bota
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
        </CardTitle>
        <CardDescription>
          Aktualny status połączenia z Discord
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Błąd: {error}</span>
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Ładowanie...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected 
                ? 'Połączony z Discord' 
                : 'Rozłączony z Discord'
              }
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 