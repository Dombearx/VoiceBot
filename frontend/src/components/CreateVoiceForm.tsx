import { useState } from 'react';
import type { DesignVoiceCommand } from '../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sparkles, Loader2, HelpCircle } from 'lucide-react';
import PromptImprovementButton from './PromptImprovementButton';
import TranslateButton from './TranslateButton';
import GenerateSampleTextButton from './GenerateSampleTextButton';

interface CreateVoiceFormProps {
  onDesign: (command: DesignVoiceCommand) => void;
  isDesigning: boolean;
  error: string | null;
  disabled?: boolean;
}

interface FormValues {
  prompt: string;
  sampleText: string;
  loudness: number;
  creativity: number;
}

interface FormErrors {
  prompt?: string;
  sampleText?: string;
  loudness?: string;
  creativity?: string;
}

export default function CreateVoiceForm({ onDesign, isDesigning, error, disabled = false }: CreateVoiceFormProps) {
  const [formValues, setFormValues] = useState<FormValues>({
    prompt: '',
    sampleText: '',
    loudness: 0.5,
    creativity: 5
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formValues.prompt.trim()) {
      newErrors.prompt = 'Opis głosu jest wymagany';
    } else if (formValues.prompt.trim().length < 20) {
      newErrors.prompt = 'Opis głosu musi mieć co najmniej 20 znaków';
    } else if (formValues.prompt.length > 1000) {
      newErrors.prompt = 'Opis głosu nie może przekraczać 1000 znaków';
    }

    if (formValues.sampleText.trim() && formValues.sampleText.trim().length < 100) {
      newErrors.sampleText = 'Przykładowy tekst musi mieć co najmniej 100 znaków';
    } else if (formValues.sampleText.length > 1000) {
      newErrors.sampleText = 'Przykładowy tekst nie może przekraczać 1000 znaków';
    }

    if (formValues.loudness < -1 || formValues.loudness > 1) {
      newErrors.loudness = 'Głośność musi być między -1 a 1';
    }

    if (formValues.creativity < 0 || formValues.creativity > 100) {
      newErrors.creativity = 'Przestrzeganie opisu musi być między 0 a 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled || !validateForm()) {
      return;
    }

    const command: DesignVoiceCommand = {
      prompt: formValues.prompt.trim(),
      sampleText: formValues.sampleText.trim() || undefined,
      loudness: formValues.loudness,
      creativity: 100 - formValues.creativity // Convert: UI shows adherence (0-100), API expects guidance scale (100-0)
    };

    onDesign(command);
  };

  const handlePromptChange = (value: string) => {
    setFormValues(prev => ({ ...prev, prompt: value }));
    if (errors.prompt) {
      setErrors(prev => ({ ...prev, prompt: undefined }));
    }
  };

  const handleSampleTextChange = (value: string) => {
    setFormValues(prev => ({ ...prev, sampleText: value }));
    if (errors.sampleText) {
      setErrors(prev => ({ ...prev, sampleText: undefined }));
    }
  };

  const handlePromptImprove = (improvedPrompt: string) => {
    setFormValues(prev => ({ ...prev, prompt: improvedPrompt }));
    if (errors.prompt) {
      setErrors(prev => ({ ...prev, prompt: undefined }));
    }
  };

  const handleLoudnessChange = (value: number[]) => {
    setFormValues(prev => ({ ...prev, loudness: value[0] }));
    if (errors.loudness) {
      setErrors(prev => ({ ...prev, loudness: undefined }));
    }
  };

  const handleCreativityChange = (value: number[]) => {
    setFormValues(prev => ({ ...prev, creativity: value[0] }));
    if (errors.creativity) {
      setErrors(prev => ({ ...prev, creativity: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Opis Głosu
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Podaj jasny i szczegółowy opis głosu, który chcesz stworzyć. Uwzględnij charakterystyki takie jak płeć, wiek, akcent, ton i styl mówienia.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2">
          <Textarea
            id="prompt"
            placeholder="Opisz głos, który chcesz stworzyć (np. 'Ciepły, przyjazny kobiecy głos z lekkim brytyjskim akcentem')"
            value={formValues.prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            className={`min-h-[100px] ${errors.prompt ? 'border-red-500' : ''}`}
            disabled={isDesigning || disabled}
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <PromptImprovementButton
                  prompt={formValues.prompt}
                  onImprove={handlePromptImprove}
                  disabled={isDesigning || disabled}
                />
                <TranslateButton
                  prompt={formValues.prompt}
                  onTranslate={handlePromptImprove}
                  disabled={isDesigning || disabled}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Użyj AI, aby ulepszyć i dopracować opis swojego głosu</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-xs text-gray-500">
                {formValues.prompt.length}/1000 znaków
              </span>
            </div>
          </div>
          {errors.prompt && (
            <p className="text-sm text-red-600">{errors.prompt}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-2">
          <label htmlFor="sampleText" className="block text-sm font-medium text-gray-700">
            Przykładowy Tekst (Opcjonalnie)
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Podaj przykładowy tekst, który będzie użyty do wygenerowania próbek głosu. Jeśli nie podasz, system automatycznie wygeneruje odpowiedni tekst.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="space-y-2">
          <Textarea
            id="sampleText"
            placeholder="Wprowadź tekst, który ma być wypowiedziany w próbce głosu (opcjonalnie - zostanie automatycznie wygenerowany, jeśli nie podasz)"
            value={formValues.sampleText}
            onChange={(e) => handleSampleTextChange(e.target.value)}
            className={`min-h-[80px] ${errors.sampleText ? 'border-red-500' : ''}`}
            disabled={isDesigning || disabled}
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <GenerateSampleTextButton
                  voiceDescription={formValues.prompt}
                  onGenerate={handleSampleTextChange}
                  disabled={isDesigning || disabled}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Wygeneruj przykładowy tekst automatycznie na podstawie opisu głosu</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {formValues.sampleText.length}/1000 znaków {formValues.sampleText.trim() ? '(min 100)' : '(opcjonalnie)'}
            </span>
          </div>
          {errors.sampleText && (
            <p className="text-sm text-red-600">{errors.sampleText}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <label htmlFor="loudness" className="block text-sm font-medium text-gray-700">
              Głośność
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Kontroluje poziom głośności głosu. Wartości od -1 (ciszej) do 1 (głośniej). 0 to około -24 LUFS.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Slider
            id="loudness"
            min={-1}
            max={1}
            step={0.1}
            value={[formValues.loudness]}
            onValueChange={handleLoudnessChange}
            disabled={isDesigning || disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Ciszej (-1)</span>
            <span>Głośniej (1)</span>
          </div>
          {errors.loudness && (
            <p className="text-sm text-red-600 mt-1">{errors.loudness}</p>
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <label htmlFor="creativity" className="block text-sm font-medium text-gray-700">
              Przestrzeganie Opisu
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Kontroluje, jak ściśle głos ma przestrzegać opisu. Wyższe wartości oznaczają bardziej dokładne przestrzeganie opisu, niższe pozwalają na większą kreatywność.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Slider
            id="creativity"
            min={0}
            max={100}
            step={1}
            value={[formValues.creativity]}
            onValueChange={handleCreativityChange}
            disabled={isDesigning || disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Swoboda Twórcza (0)</span>
            <span>Ścisłe Przestrzeganie (100)</span>
          </div>
          {errors.creativity && (
            <p className="text-sm text-red-600 mt-1">{errors.creativity}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">
            <strong>Błąd:</strong> {error}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">
            {formValues.prompt.trim().length < 20 ? 
              `Potrzebujesz ${20 - formValues.prompt.trim().length} więcej znaków (min 20)` : 
              'Gotowe do generowania'
            }
          </span>
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={isDesigning || disabled || formValues.prompt.trim().length < 20}
                      className="flex items-center space-x-2"
                    >
                      {isDesigning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generowanie Próbek...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generuj Próbki Głosu</span>
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {(disabled || formValues.prompt.trim().length < 20) && (
                  <TooltipContent className="bg-gray-900 text-white border border-gray-700 shadow-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Wymagania do generowania próbek:</p>
                      <ul className="text-sm space-y-1">
                        {disabled && (
                          <li>• Osiągnięto limit 9 głosów - usuń niektóre aby utworzyć nowe</li>
                        )}
                        {formValues.prompt.trim().length < 20 && (
                          <li>• Opis głosu musi mieć co najmniej 20 znaków (obecnie: {formValues.prompt.trim().length})</li>
                        )}
                      </ul>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Wygeneruj wiele próbek głosu na podstawie twojego opisu, z których będziesz mógł wybrać</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </form>
  );
} 