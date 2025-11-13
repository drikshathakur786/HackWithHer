
import { cn } from '@/lib/utils';
import { HeartIcon, Share2Icon } from 'lucide-react';
import { Button } from './button';

interface ArticleCardProps {
  category: string;
  title: string;
  summary: string;
  author: {
    name: string;
    title: string;
  };
  date: string;
  readTime: string;
  imageSrc?: string;
  className?: string;
}

export function ArticleCard({ 
  category, 
  title, 
  summary, 
  author, 
  date, 
  readTime, 
  imageSrc = "/placeholder.svg", 
  className 
}: ArticleCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-border/30 hover:shadow-md transition-all", className)}>
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <div className="p-5">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-200">
            {category}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{summary}</p>
        
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0"></div>
          <div className="ml-3">
            <div className="text-sm font-medium">Dr. {author.name}</div>
            <div className="text-xs text-muted-foreground">{author.title}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>{date}</span>
            <span>{readTime} read</span>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HeartIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-border/30">
        <Button variant="link" className="p-0 h-auto text-brand">Read More</Button>
      </div>
    </div>
  );
}
