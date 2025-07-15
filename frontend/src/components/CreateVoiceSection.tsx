import { useState } from 'react';
import type { VoiceDTO, DesignVoiceCommand, CreateVoiceCommand, VoicePreviewDTO } from '../types';
import { useDesignVoice, useCreateVoice } from '../lib/hooks/useVoices';
import CreateVoiceForm from './CreateVoiceForm';
import VoicePreviewsList from './VoicePreviewsList';
import NameDescriptionForm from './NameDescriptionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateVoiceSectionProps {
  onVoiceCreated: (voice: VoiceDTO) => void;
  currentVoiceCount: number;
}

export default function CreateVoiceSection({ onVoiceCreated, currentVoiceCount }: CreateVoiceSectionProps) {
  const [previews, setPreviews] = useState<VoicePreviewDTO[]>([]);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const [sampleText, setSampleText] = useState<string>('');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  
  const { designVoice, isDesigning, error: designError } = useDesignVoice();
  const { createVoice, isCreating, error: createError } = useCreateVoice();

  const maxVoices = 9;
  const isAtLimit = currentVoiceCount >= maxVoices;

  const handleDesignVoice = async (command: DesignVoiceCommand) => {
    if (isAtLimit) {
      toast.error('Osiągnięto maksymalną liczbę głosów (9). Usuń niektóre głosy, aby utworzyć nowe.');
      return;
    }

    setCurrentPrompt(command.prompt); // Store the prompt
    const result = await designVoice(command);
    if (result) {
      setPreviews(result.previews);
      setSampleText(result.text);
      setSelectedPreviewId(null); // Reset selection
      toast.success(`Pomyślnie wygenerowano ${result.previews.length} próbek głosu!`);
    }
  };

  const handlePreviewSelect = (previewId: string) => {
    setSelectedPreviewId(previewId);
  };

  const handleCreateVoice = async (command: CreateVoiceCommand) => {
    if (isAtLimit) {
      toast.error('Osiągnięto maksymalną liczbę głosów (9). Usuń niektóre głosy, aby utworzyć nowe.');
      return;
    }

    const result = await createVoice(command);
    if (result) {
      onVoiceCreated(result);
      // Reset the form
      setPreviews([]);
      setSelectedPreviewId(null);
      setSampleText('');
      setCurrentPrompt('');
      toast.success(`Głos "${result.name}" został pomyślnie utworzony!`);
    }
  };

  const showPreviews = previews.length > 0;
  const showNameForm = selectedPreviewId !== null;

  return (
    <Card className={isAtLimit ? 'opacity-60' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="w-5 h-5 text-blue-500" />
          <span>Utwórz Nowy Głos</span>
        </CardTitle>
        <CardDescription>
          Wygeneruj niestandardowy głos, opisując jego charakterystyki
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Limit Warning */}
        {isAtLimit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Osiągnięto maksymalną liczbę głosów ({maxVoices}). Usuń niektóre głosy, aby utworzyć nowe.
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Voice Creation Form */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Opisz Swój Głos</h3>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          
          <CreateVoiceForm
            onDesign={handleDesignVoice}
            isDesigning={isDesigning}
            error={designError}
            disabled={isAtLimit}
          />
        </div>

        {/* Step 2: Voice Previews */}
        {showPreviews && !isAtLimit && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Wybierz Próbkę Głosu</h3>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            
            <VoicePreviewsList
              previews={previews}
              sampleText={sampleText}
              selectedPreviewId={selectedPreviewId}
              onSelect={handlePreviewSelect}
            />
          </div>
        )}

        {/* Step 3: Name and Description */}
        {showNameForm && !isAtLimit && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Nazwij Swój Głos</h3>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            
            <NameDescriptionForm
              generatedVoiceId={selectedPreviewId}
              initialPrompt={currentPrompt}
              onCreateVoice={handleCreateVoice}
              isCreating={isCreating}
              error={createError}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 