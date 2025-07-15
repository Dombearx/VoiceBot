import { useState } from 'react';
import type { VoiceDTO } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, Mic, AlertCircle } from 'lucide-react';
import VoiceDetailsModal from './VoiceDetailsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface VoicesTableProps {
  voices: VoiceDTO[];
  onDelete: (voiceId: string) => void;
  isLoading: boolean;
}

export default function VoicesTable({ voices, onDelete, isLoading }: VoicesTableProps) {
  const [selectedVoice, setSelectedVoice] = useState<VoiceDTO | null>(null);
  const [voiceToDelete, setVoiceToDelete] = useState<VoiceDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = (voice: VoiceDTO) => {
    setSelectedVoice(voice);
  };

  const handleDeleteClick = (voice: VoiceDTO) => {
    setVoiceToDelete(voice);
  };

  const handleDeleteConfirm = async () => {
    if (!voiceToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(voiceToDelete.id);
      setVoiceToDelete(null);
    } catch (error) {
      console.error('Error deleting voice:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setVoiceToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getVoiceCountText = (count: number) => {
    if (count === 1) return '1 głos';
    if (count >= 2 && count <= 4) return `${count} głosy`;
    return `${count} głosów`;
  };

  const voiceCount = voices.length;
  const maxVoices = 9;
  const progressPercentage = (voiceCount / maxVoices) * 100;
  const isAtLimit = voiceCount >= maxVoices;

  return (
    <div className="space-y-4">
      {/* Voice Limit Progress Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Mic className="w-5 h-5 text-blue-500" />
              <span>Twoje Głosy</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={isAtLimit ? "destructive" : "secondary"}>
                {voiceCount}/{maxVoices}
              </Badge>
              {isAtLimit && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {isAtLimit ? 'Osiągnięto maksymalną liczbę głosów' : `Możesz utworzyć jeszcze ${maxVoices - voiceCount} głosów`}
              </span>
              <span className="text-gray-500">
                {getVoiceCountText(voiceCount)}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              // Custom styling for the progress bar
              style={{
                backgroundColor: '#f3f4f6'
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Voices Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Ładowanie głosów...</p>
              </div>
            </div>
          ) : voices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nie masz jeszcze żadnych głosów</p>
              <p className="text-sm">Utwórz swój pierwszy głos poniżej</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-700">Nazwa</th>
                    <th className="text-left p-4 font-medium text-gray-700">Opis</th>
                    <th className="text-left p-4 font-medium text-gray-700">Utworzono</th>
                    <th className="text-left p-4 font-medium text-gray-700">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {voices.map((voice) => (
                    <tr 
                      key={voice.id} 
                      className="border-b hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(voice)}
                    >
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{voice.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {truncateText(voice.prompt, 100)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600 flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(voice.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(voice);
                            }}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Usuń</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <VoiceDetailsModal
        isOpen={selectedVoice !== null}
        voice={selectedVoice}
        onClose={() => setSelectedVoice(null)}
      />

      <DeleteConfirmationModal
        isOpen={voiceToDelete !== null}
        voiceName={voiceToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  );
} 