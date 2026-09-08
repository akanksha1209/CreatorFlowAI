import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Select = ({ value, onValueChange, className, children }: SelectProps) => (
  <SelectContext.Provider value={{ value, onValueChange }}>
    <div className={cn('relative w-full', className)}>{children}</div>
  </SelectContext.Provider>
);

export const SelectTrigger = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <button type="button" className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)}>
    {children}
  </button>
);

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext);
  return <span>{context?.value || placeholder || 'Select...'}</span>;
};

export const SelectContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn('mt-1 rounded-md border bg-popover p-1 shadow-md', className)}>{children}</div>
);

export const SelectItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const context = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => context?.onValueChange(value)}
      className={cn('flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground', value === context?.value && 'bg-accent text-accent-foreground', className)}
    >
      {children}
    </button>
  );
};
