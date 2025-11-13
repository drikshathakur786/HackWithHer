
import { cn } from '@/lib/utils';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { Button } from './button';

interface DiscussionCardProps {
  author: string;
  timeAgo: string;
  content: string;
  likes: number;
  replies: number;
  tag?: string;
  className?: string;
}

export function DiscussionCard({ 
  author, 
  timeAgo, 
  content, 
  likes, 
  replies, 
  tag, 
  className 
}: DiscussionCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg border-l-4 border-brand border border-border/30 p-4", className)}>
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
        <div>
          <div className="font-medium">{author}</div>
          <div className="text-xs text-muted-foreground">{timeAgo}</div>
        </div>
      </div>
      
      <p className="text-sm mb-4">{content}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
            <Heart className="h-4 w-4" />
            <span>{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
            <MessageSquare className="h-4 w-4" />
            <span>{replies}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        {tag && (
          <div className="px-2 py-1 text-xs rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-200">
            {tag}
          </div>
        )}
      </div>
    </div>
  );
}
