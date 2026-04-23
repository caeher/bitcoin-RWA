import { cn } from '@lib/utils';

export const fieldControlClassName = (...classes: Array<string | false | null | undefined>) =>
  cn(
    'flex w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-foreground-muted',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bitcoin/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
    ...classes
  );

export const fieldMessageClassName = 'mt-1.5 text-sm';
export const fieldLabelClassName = 'block text-sm font-medium text-foreground mb-1.5';
export const compactFieldLabelClassName = 'block text-xs font-medium text-foreground-secondary mb-1';