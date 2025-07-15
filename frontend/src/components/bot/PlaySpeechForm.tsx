import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import type { VoiceDetailDTO, PlayCommand } from '../../types';
import { Play, Square, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Validation schema
const playSpeechSchema = z.object({
  voiceId: z.string().min(1, 'Wybierz głos'),
  text: z.string()
    .min(1, 'Wprowadź tekst do odtworzenia')
    .max(1000, 'Tekst nie może być dłuższy niż 1000 znaków')
});

type PlaySpeechFormData = z.infer<typeof playSpeechSchema>;

interface PlaySpeechFormProps {
  voices: VoiceDetailDTO[];
  isLoading: boolean;
  error: string | null;
  onPlay: (command: PlayCommand) => Promise<void>;
  onCancel: () => void;
}

export default function PlaySpeechForm({
  voices,
  isLoading,
  error,
  onPlay,
  onCancel
}: PlaySpeechFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<PlaySpeechFormData>({
    resolver: zodResolver(playSpeechSchema),
    defaultValues: {
      voiceId: '',
      text: ''
    },
    mode: 'onChange'
  });

  const watchedText = watch('text');
  const watchedVoiceId = watch('voiceId');
  const textLength = watchedText?.length || 0;

  const handleFormSubmit = async (data: PlaySpeechFormData) => {
    try {
      await onPlay({
        voiceId: data.voiceId,
        text: data.text
      });
      
      // Don't reset form after successful play to allow replaying
      toast.success('Odtwarzanie rozpoczęte');
    } catch (err) {
      // Error handling is done in parent component
      console.error('Play speech error:', err);
    }
  };

  const handleCancel = () => {
    onCancel();
    toast.info('Odtwarzanie anulowane');
  };

  const handleClearForm = () => {
    reset();
    toast.info('Formularz wyczyszczony');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Odtwarzanie Mowy
        </CardTitle>
        <CardDescription>
          Wybierz głos i tekst do odtworzenia przez bota
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Voice Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={watchedVoiceId}
                  onValueChange={(value) => setValue('voiceId', value, { shouldValidate: true })}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.voiceId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Wybierz głos..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <span className="font-medium">{voice.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {errors.voiceId && (
              <p className="text-sm text-red-600">{errors.voiceId.message}</p>
            )}
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                Tekst do odtworzenia
              </label>
              <span className={`text-xs ${textLength > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                {textLength}/1000
              </span>
            </div>
            <Textarea
              id="text"
              {...register('text')}
              placeholder="Wprowadź tekst do odtworzenia..."
              rows={4}
              maxLength={1000}
              disabled={isLoading}
              className={errors.text ? 'border-red-500' : ''}
            />
            {errors.text && (
              <p className="text-sm text-red-600">{errors.text.message}</p>
            )}
            
            {/* Character count progress */}
            <div className="space-y-1">
              <Progress value={(textLength / 1000) * 100} className="h-1" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Minimum: 1 znak</span>
                <span>Maksimum: 1000 znaków</span>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              Błąd odtwarzania: {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-sm text-gray-500 text-center py-2">
              Ładowanie głosów...
            </div>
          )}

          {/* Empty Voices State */}
          {!isLoading && voices.length === 0 && !error && (
            <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
              Brak dostępnych głosów. Utwórz nowy głos w sekcji "Głosy".
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isLoading ? (
              <>
                <Button
                  type="submit"
                  disabled={!isValid || isLoading || voices.length === 0}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Odtwórz
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearForm}
                  disabled={isLoading}
                >
                  Wyczyść
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Anuluj
              </Button>
            )}
          </div>

          {/* Playing State */}
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Odtwarzanie w toku...</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 