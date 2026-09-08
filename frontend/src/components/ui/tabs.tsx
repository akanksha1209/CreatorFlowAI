import * as React from 'react';
import { cn } from '@/lib/utils';

const TabsContext = React.createContext<{ value: string; onValueChange: (value: string) => void } | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs = ({ value, onValueChange, className, children }: TabsProps) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div className={cn('space-y-4', className)}>{children}</div>
  </TabsContext.Provider>
);

export const TabsList = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>{children}</div>
);

export const TabsTrigger = ({ value: tabValue, className, children }: { value: string; className?: string; children: React.ReactNode }) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const active = context.value === tabValue;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(tabValue)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value: tabValue, className, children }: { value: string; className?: string; children: React.ReactNode }) => {
  const context = React.useContext(TabsContext);
  if (!context || context.value !== tabValue) return null;
  return <div className={cn('mt-2', className)}>{children}</div>;
};
