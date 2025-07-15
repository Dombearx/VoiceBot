import { useState, useEffect } from 'react';
import type { VoiceDTO } from '../types';
import { fetchVoices, deleteVoice } from '../lib/voiceService';
import VoicesTable from '../components/VoicesTable';
import CreateVoiceSection from '../components/CreateVoiceSection';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function VoicesPage() {
  const [voices, setVoices] = useState<VoiceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchVoices();
      // Sort voices by creation date (newest first)
      const sortedVoices = response.items.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setVoices(sortedVoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się załadować głosów');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVoices();
  }, []);

  const handleVoiceCreated = (newVoice: VoiceDTO) => {
    setVoices(prev => {
      const updated = [newVoice, ...prev];
      // Sort to ensure newest first
      return updated.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  };

  const handleVoiceDeleted = async (voiceId: string) => {
    try {
      await deleteVoice(voiceId);
      setVoices(prev => prev.filter(voice => voice.id !== voiceId));
      toast.success('Głos został pomyślnie usunięty');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć głosu';
      toast.error(`Błąd usuwania głosu: ${errorMessage}`);
    }
  };

  const handleRefresh = () => {
    loadVoices();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Głosy</h1>
          <p className="text-gray-600 mt-1">Zarządzaj swoją kolekcją głosów</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Odśwież
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">
            <strong>Błąd:</strong> {error}
          </div>
        </div>
      )}

      <div className="space-y-8">
        <VoicesTable 
          voices={voices} 
          onDelete={handleVoiceDeleted}
          isLoading={isLoading}
        />
        
        <CreateVoiceSection 
          onVoiceCreated={handleVoiceCreated} 
          currentVoiceCount={voices.length}
        />
      </div>
    </div>
  );
} 