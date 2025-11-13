import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, RepeatIcon, PlayIcon, Edit3Icon, Trash2Icon } from 'lucide-react';
import { Button } from './button';
import { useRef, useEffect } from 'react';

interface MessageCardProps {
  id: number;
  message: string;
  scheduledFor: Date;
  repeat?: string;
  voiceNote?: Blob | null;
  className?: string;
  onEdit: () => void;
  onDelete?: () => void;
}

export function MessageCard({ id, message, scheduledFor, repeat, voiceNote, className, onEdit, onDelete }: MessageCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoiceNote = () => {
    if (voiceNote && audioRef.current) {
      const url = URL.createObjectURL(voiceNote);
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("ended", () => {
        if (audioRef.current) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      });
    }
  }, []);

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-border/30 p-4 hover:shadow-md transition-all", className)}>
      <p className="text-foreground mb-4 line-clamp-3">{message}</p>
      
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{format(scheduledFor, 'PPP')}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="h-3.5 w-3.5" />
          <span>{format(scheduledFor, 'p')}</span>
        </div>
        {repeat && (
          <div className="flex items-center gap-1">
            <RepeatIcon className="h-3.5 w-3.5" />
            <span>{repeat}</span>
          </div>
        )}
      </div>

      {voiceNote && (
        <div className="flex items-center mb-3">
          <Button variant="outline" size="sm" onClick={playVoiceNote}>
            <PlayIcon className="mr-2 h-4 w-4" />
            Play Voice Note
          </Button>
          <audio ref={audioRef} />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit3Icon className="mr-2 h-4 w-4" />
          Edit
        </Button>
        {onDelete && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}