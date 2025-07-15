import type { VoiceDTO } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mic, Calendar, FileText } from 'lucide-react';

interface VoiceDetailsModalProps {
  isOpen: boolean;
  voice: VoiceDTO | null;
  onClose: () => void;
}

export default function VoiceDetailsModal({
  isOpen,
  voice,
  onClose
}: VoiceDetailsModalProps) {
  if (!voice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-blue-500" />
            <span>{voice.name}</span>
          </DialogTitle>
          <DialogDescription>
            Szczegóły głosu i opis
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Utworzono</span>
              </div>
              <p className="text-sm text-gray-600">
                {new Date(voice.createdAt).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Full Prompt */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              <span>Opis Głosu</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {voice.prompt}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {voice.prompt.length} znaków
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 