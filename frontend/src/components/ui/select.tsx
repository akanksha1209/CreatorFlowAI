import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}
const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps { value: string; onValueChange: (value: string) => void; className?: string; children: React.ReactNode }
export const Select = ({ value, onValueChange, className, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  return <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}><div className={cn('relative w-full', className)}>{children}</div></SelectContext.Provider>;
};

export const SelectTrigger = ({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const context = React.useContext(SelectContext);
  return <button type="button" aria-haspopup="listbox" aria-expanded={context?.open} onClick={() => context?.setOpen(!context.open)} className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring', className)} {...props}>{children}<span aria-hidden="true">⌄</span></button>;
};

const LABELS: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese', hi: 'Hindi', professional: 'Professional', casual: 'Casual', enthusiastic: 'Enthusiastic', authoritative: 'Authoritative', friendly: 'Friendly', humorous: 'Humorous', educational: 'Educational', entertainment: 'Entertainment', inspirational: 'Inspirational', promotional: 'Promotional' };
export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext);
  return <span>{(context?.value && LABELS[context.value]) || context?.value || placeholder || 'Select...'}</span>;
};

export const SelectContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const context = React.useContext(SelectContext);
  if (!context?.open) return null;
  return <div role="listbox" className={cn('absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-md', className)}>{children}</div>;
};

export const SelectItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const context = React.useContext(SelectContext);
  return <button type="button" role="option" aria-selected={value === context?.value} onClick={() => { context?.onValueChange(value); context?.setOpen(false); }} className={cn('flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground', value === context?.value && 'bg-accent text-accent-foreground', className)}>{children}</button>;
};
