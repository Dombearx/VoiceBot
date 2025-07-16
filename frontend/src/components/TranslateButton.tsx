import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Languages, Loader2 } from 'lucide-react';
import { translateVoiceDescription } from '../lib/prompt';

interface TranslateButtonProps {
  prompt: string;
  onTranslate: (translatedPrompt: string) => void;
  disabled?: boolean;
}

export default function TranslateButton({ 
  prompt, 
  onTranslate, 
  disabled = false 
}: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!prompt.trim()) return;

    setIsTranslating(true);
    setShowError(false);
    setError(null);

    try {
      const result = await translateVoiceDescription({ voiceDescription: prompt.trim() });
      onTranslate(result.translatedDescription);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się przetłumaczyć opisu';
      setError(errorMessage);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={disabled || isTranslating || !prompt.trim()}
                className="flex items-center space-x-1"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Tłumaczenie...</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-3 h-3" />
                    <span>Przetłumacz</span>
                  </>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          {(disabled || !prompt.trim()) && (
            <TooltipContent className="bg-gray-900 text-white border border-gray-700 shadow-lg">
              <div className="space-y-1">
                <p className="font-medium">Wymagania do tłumaczenia opisu:</p>
                <ul className="text-sm space-y-1">
                  {disabled && (
                    <li>• Osiągnięto limit 9 głosów</li>
                  )}
                  {!prompt.trim() && (
                    <li>• Opis głosu musi być niepusty</li>
                  )}
                </ul>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {showError && error && (
        <div className="absolute top-full left-0 mt-1 bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-600 whitespace-nowrap z-10">
          Nie udało się przetłumaczyć opisu: {error}
        </div>
      )}
    </div>
  );
} 