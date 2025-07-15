
import type { VoicePreviewDTO } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Volume2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface VoicePreviewsListProps {
  previews: VoicePreviewDTO[];
  selectedPreviewId: string | null;
  onSelect: (previewId: string) => void;
  sampleText: string;
}

export default function VoicePreviewsList({ 
  previews, 
  selectedPreviewId, 
  onSelect, 
  sampleText 
}: VoicePreviewsListProps) {
  if (previews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Volume2 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Próbki Głosu</h3>
        <span className="text-sm text-gray-500">({previews.length} wygenerowano)</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Posłuchaj wygenerowanych próbek głosu i wybierz tę, która najbardziej Ci się podoba.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <VoicePreviewCard
            key={preview.generatedVoiceId}
            preview={preview}
            index={index + 1}
            isSelected={selectedPreviewId === preview.generatedVoiceId}
            onSelect={() => onSelect(preview.generatedVoiceId)}
            sampleText={sampleText}
          />
        ))}
      </div>
    </div>
  );
}

interface VoicePreviewCardProps {
  preview: VoicePreviewDTO;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  sampleText: string;
}

function VoicePreviewCard({ 
  preview, 
  index, 
  isSelected, 
  onSelect, 
  sampleText 
}: VoicePreviewCardProps) {
  // Convert base64 to blob URL for audio playback
  const audioUrl = `data:${preview.mediaType};base64,${preview.audioBase64}`;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:shadow-md hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Próbka Głosu {index}</span>
          {isSelected && (
            <div className="flex items-center space-x-1 text-blue-600">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Wybrana</span>
            </div>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          Czas trwania: {Math.round(preview.durationSecs)}s
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600 mb-2 font-medium">Przykładowy Tekst:</p>
          <p className="text-sm text-gray-800 italic">"{sampleText}"</p>
        </div>
        
        <div onClick={(e) => e.stopPropagation()}>
          <AudioPlayer
            src={audioUrl}
            mediaType={preview.mediaType}
            durationSecs={preview.durationSecs}
            className="w-full"
          />
        </div>
        
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Wybrana
            </>
          ) : (
            'Wybierz Ten Głos'
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 