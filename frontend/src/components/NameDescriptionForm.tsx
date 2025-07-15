import { useState, useEffect } from 'react';
import type { CreateVoiceCommand } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Loader2, User } from 'lucide-react';

interface NameDescriptionFormProps {
  generatedVoiceId: string;
  initialPrompt: string;
  onCreateVoice: (command: CreateVoiceCommand) => void;
  isCreating: boolean;
  error: string | null;
}

interface FormValues {
  voiceName: string;
  voiceDescription: string;
}

interface FormErrors {
  voiceName?: string;
}

export default function NameDescriptionForm({ 
  generatedVoiceId, 
  initialPrompt,
  onCreateVoice, 
  isCreating, 
  error 
}: NameDescriptionFormProps) {
  const [formValues, setFormValues] = useState<FormValues>({
    voiceName: '',
    voiceDescription: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Auto-set voice description from initial prompt
  useEffect(() => {
    if (initialPrompt && !formValues.voiceDescription) {
      setFormValues(prev => ({ ...prev, voiceDescription: initialPrompt }));
    }
  }, [initialPrompt, formValues.voiceDescription]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formValues.voiceName.trim()) {
      newErrors.voiceName = 'Nazwa głosu jest wymagana';
    } else if (formValues.voiceName.length > 100) {
      newErrors.voiceName = 'Nazwa głosu nie może przekraczać 100 znaków';
    }

    // Voice description is auto-filled and readonly, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const command: CreateVoiceCommand = {
      voiceName: formValues.voiceName.trim(),
      voiceDescription: formValues.voiceDescription.trim(),
      generatedVoiceId
    };

    onCreateVoice(command);
  };

  const handleNameChange = (value: string) => {
    setFormValues(prev => ({ ...prev, voiceName: value }));
    if (errors.voiceName) {
      setErrors(prev => ({ ...prev, voiceName: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5 text-green-600" />
          <span>Krok 3: Nazwij Swój Głos</span>
        </CardTitle>
        <CardDescription>
          Nadaj nazwę swojemu głosowi i sprawdź opis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="voiceName" className="block text-sm font-medium text-gray-700 mb-2">
              Nazwa Głosu
            </label>
            <Input
              id="voiceName"
              type="text"
              placeholder="Wprowadź nazwę dla swojego głosu"
              value={formValues.voiceName}
              onChange={(e) => handleNameChange(e.target.value)}
              className={errors.voiceName ? 'border-red-500' : ''}
              disabled={isCreating}
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {formValues.voiceName.length}/100 znaków
              </span>
            </div>
            {errors.voiceName && (
              <p className="text-sm text-red-600 mt-1">{errors.voiceName}</p>
            )}
          </div>

          <div>
            <label htmlFor="voiceDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Opis Głosu
            </label>
            <div className="bg-gray-50 rounded-md p-3 min-h-[100px] border border-gray-200">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {formValues.voiceDescription || 'Opis głosu zostanie ustawiony automatycznie z twojego opisu'}
              </p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                Wypełnione automatycznie z opisu głosu
              </span>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      type="submit"
                      disabled={isCreating || !formValues.voiceName.trim()}
                      className="flex items-center space-x-2"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Tworzenie Głosu...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Utwórz Głos</span>
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!formValues.voiceName.trim() && (
                  <TooltipContent className="bg-gray-900 text-white border border-gray-700 shadow-lg">
                    <p>Wymagania do utworzenia głosu:</p>
                    <p className="text-sm">• Nazwa głosu jest wymagana</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 