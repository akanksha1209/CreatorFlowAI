import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface Stage {
  id: string;
  label: string;
  icon: string;
}

const stages: Stage[] = [
  { id: 'analyzing', label: 'Analyzing your topic...', icon: '🔍' },
  { id: 'audience', label: 'Identifying your audience...', icon: '🎯' },
  { id: 'platform', label: 'Choosing the best platform...', icon: '📱' },
  { id: 'angle', label: 'Finding the strongest content angle...', icon: '💡' },
  { id: 'titles', label: 'Generating titles and hooks...', icon: '✍️' },
  { id: 'script', label: 'Writing your script...', icon: '📝' },
  { id: 'package', label: 'Building your content package...', icon: '📦' },
];

interface LoadingStagesProps {
  currentStage: number;
  className?: string;
}

export const LoadingStages = ({ currentStage, className }: LoadingStagesProps) => {
  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="mb-6 flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          {stages[currentStage]?.label || 'Processing...'}
        </p>
      </div>
      
      <div className="space-y-2">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: index <= currentStage ? 1 : 0.5, x: index <= currentStage ? 0 : -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-2 text-sm',
              index <= currentStage
                ? 'bg-primary/10 text-primary'
                : 'bg-muted/50 text-muted-foreground'
            )}
          >
            <span className="text-lg">{stage.icon}</span>
            <span>{stage.label}</span>
            {index < currentStage && (
              <svg className="ml-auto h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};