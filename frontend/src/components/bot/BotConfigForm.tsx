import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Upload, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import type { BotConfigCommand, BotConfigResponseDTO } from '../../types';

// Validation schema
const botConfigSchema = z.object({
  nickname: z.string()
    .min(1, 'Nazwa bota jest wymagana')
    .max(32, 'Nazwa bota nie może być dłuższa niż 32 znaki')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Nazwa bota może zawierać tylko litery, cyfry, spacje, myślniki i podkreślenia'),
  avatar: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= 8 * 1024 * 1024; // 8MB
    }, 'Plik avatara nie może być większy niż 8MB')
    .refine((file) => {
      if (!file) return true;
      return ['image/jpeg', 'image/png'].includes(file.type);
    }, 'Avatar musi być w formacie JPG lub PNG')
});

type BotConfigFormData = z.infer<typeof botConfigSchema>;

interface BotConfigFormProps {
  initialNickname?: string;
  initialAvatarUrl?: string;
  isUpdating: boolean;
  error: string | null;
  onSubmit: (command: BotConfigCommand) => Promise<BotConfigResponseDTO>;
}

export default function BotConfigForm({
  initialNickname = '',
  initialAvatarUrl,
  isUpdating,
  error,
  onSubmit
}: BotConfigFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl || null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue
  } = useForm<BotConfigFormData>({
    resolver: zodResolver(botConfigSchema),
    defaultValues: {
      nickname: initialNickname,
      avatar: undefined
    }
  });



  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('avatar', file, { shouldValidate: true, shouldDirty: true });
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFormSubmit = async (data: BotConfigFormData) => {
    try {
      const command: BotConfigCommand = {
        nickname: data.nickname,
        avatar: data.avatar as File // We know it's File from validation
      };

      const response = await onSubmit(command);
      
      // Update preview URL with response
      if (response.avatarUrl) {
        setPreviewUrl(response.avatarUrl);
      }
      
      toast.success('Konfiguracja bota została zaktualizowana');
    } catch (err) {
      // Error handling is done in parent component
      console.error('Form submission error:', err);
    }
  };

  const removeAvatar = () => {
    setValue('avatar', undefined, { shouldValidate: true, shouldDirty: true });
    setPreviewUrl(initialAvatarUrl || null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          Konfiguracja Bota
        </CardTitle>
        <CardDescription>
          Zmień nazwę i avatar bota
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Nickname Field */}
          <div className="space-y-2">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
              Nazwa bota
            </label>
            <Input
              id="nickname"
              {...register('nickname')}
              placeholder="Wprowadź nazwę bota..."
              disabled={isUpdating}
              className={errors.nickname ? 'border-red-500' : ''}
            />
            {errors.nickname && (
              <p className="text-sm text-red-600">{errors.nickname.message}</p>
            )}
          </div>

          {/* Avatar Field */}
          <div className="space-y-2">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
              Avatar
            </label>
            
            {/* Avatar Preview */}
            {previewUrl && (
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    disabled={isUpdating}
                  >
                    ×
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Aktualny avatar
                </div>
              </div>
            )}

            {/* File Input */}
            <div className="flex items-center gap-2">
              <Input
                id="avatar"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleAvatarChange}
                disabled={isUpdating}
                className={errors.avatar ? 'border-red-500' : ''}
              />
              <Upload className="w-5 h-5 text-gray-400" />
            </div>
            
            {errors.avatar && (
              <p className="text-sm text-red-600">{errors.avatar.message}</p>
            )}
            
            <p className="text-xs text-gray-500">
              Obsługiwane formaty: JPG, PNG. Maksymalny rozmiar: 8MB
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              Błąd aktualizacji: {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="outline"
              disabled={isUpdating || !isDirty}
              className="flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Zapisz zmiany
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 