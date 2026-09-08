import { cn } from '@/lib/utils';

interface ScoreIndicatorProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreIndicator = ({ 
  score, 
  maxScore = 100, 
  label = 'Score',
  size = 'md'
}: ScoreIndicatorProps) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  const getColor = () => {
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBarColor = () => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const barSizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn('font-bold', sizeClasses[size], getColor())}>
        {score}/{maxScore}
      </span>
      <div className="w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};