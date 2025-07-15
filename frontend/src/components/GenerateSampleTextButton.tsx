import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateSampleTextButtonProps {
  voiceDescription: string;
  onGenerate: (sampleText: string) => void;
  disabled?: boolean;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function GenerateSampleTextButton({ 
  voiceDescription, 
  onGenerate, 
  disabled = false 
}: GenerateSampleTextButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!voiceDescription.trim()) return;

    setIsGenerating(true);
    setShowError(false);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/prompts/generate-sample-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceDescription: voiceDescription.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onGenerate(data.sampleText);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się wygenerować przykładowego tekstu');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsGenerating(false);
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
                onClick={handleGenerate}
                disabled={disabled || isGenerating || !voiceDescription.trim()}
                className="flex items-center space-x-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Generowanie...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Generuj Przykładowy Tekst</span>
                  </>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          {(disabled || !voiceDescription.trim()) && (
            <TooltipContent className="bg-gray-900 text-white border border-gray-700 shadow-lg">
              <div className="space-y-1">
                <p className="font-medium">Wymagania do generowania tekstu:</p>
                <ul className="text-sm space-y-1">
                  {disabled && (
                    <li>• Osiągnięto limit 9 głosów</li>
                  )}
                  {!voiceDescription.trim() && (
                    <li>• Opis głosu jest wymagany</li>
                  )}
                </ul>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {showError && error && (
        <div className="absolute top-full left-0 mt-1 bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-600 whitespace-nowrap z-10 max-w-xs">
          Nie udało się wygenerować przykładowego tekstu: {error}
        </div>
      )}
    </div>
  );
} 