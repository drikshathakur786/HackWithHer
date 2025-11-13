
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-border/30", className)}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-brand mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
