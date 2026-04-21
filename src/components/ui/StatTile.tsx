import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

const statTileVariants = cva('rounded-lg p-4', {
  variants: {
    surface: {
      elevated: 'bg-background-elevated',
      subtle: 'bg-background-surface border border-border',
      transparent: 'bg-transparent',
    },
    size: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
  },
  defaultVariants: {
    surface: 'elevated',
    size: 'md',
  },
});

const toneClasses = {
  neutral: 'text-foreground',
  bitcoin: 'text-accent-bitcoin',
  success: 'text-accent-green',
  danger: 'text-accent-red',
  info: 'text-accent-blue',
};

interface StatTileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statTileVariants> {
  label: React.ReactNode;
  value: React.ReactNode;
  helperText?: React.ReactNode;
  icon?: React.ReactNode;
  valueTone?: keyof typeof toneClasses;
  mono?: boolean;
  labelClassName?: string;
  valueClassName?: string;
}

export function StatTile({
  className,
  surface,
  size,
  label,
  value,
  helperText,
  icon,
  valueTone = 'neutral',
  mono,
  labelClassName,
  valueClassName,
  ...props
}: StatTileProps) {
  return (
    <div className={cn(statTileVariants({ surface, size }), className)} {...props}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className={cn('text-xs text-foreground-secondary', labelClassName)}>{label}</p>
        {icon}
      </div>
      <p className={cn('font-medium', mono && 'font-mono', toneClasses[valueTone], valueClassName)}>{value}</p>
      {helperText && <p className="text-xs text-foreground-secondary mt-1">{helperText}</p>}
    </div>
  );
}
