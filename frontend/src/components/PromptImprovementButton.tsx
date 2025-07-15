import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Wand2, Loader2 } from 'lucide-react';
import { usePromptImprovement } from '../lib/hooks/useVoices';

interface PromptImprovementButtonProps {
  prompt: string;
  onImprove: (improvedPrompt: string) => void;
  disabled?: boolean;
}

export default function PromptImprovementButton({ 
  prompt, 
  onImprove, 
  disabled = false 
}: PromptImprovementButtonProps) {
  const { improvePrompt, isImproving, error } = usePromptImprovement();
  const [showError, setShowError] = useState(false);

  const handleImprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!prompt.trim()) return;

    setShowError(false);
    const result = await improvePrompt({ prompt: prompt.trim() });
    
    if (result) {
      onImprove(result.improvedPrompt);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
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
                onClick={handleImprove}
                disabled={disabled || isImproving || !prompt.trim()}
                className="flex items-center space-x-1"
              >
                {isImproving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Ulepszanie...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3" />
                    <span>Ulepsz Opis</span>
                  </>
                )}
              </Button>
            </div>
          </TooltipTrigger>
          {(disabled || !prompt.trim()) && (
            <TooltipContent className="bg-gray-900 text-white border border-gray-700 shadow-lg">
              <div className="space-y-1">
                <p className="font-medium">Wymagania do ulepszenia opisu:</p>
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
          Nie udało się ulepszyć opisu: {error}
        </div>
      )}
    </div>
  );
} 