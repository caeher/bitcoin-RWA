import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

const infoRowVariants = cva('flex items-center justify-between gap-4', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
    variant: {
      default: '',
      muted: 'text-foreground-secondary',
      bordered: 'rounded-md border border-border px-3 py-2',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

interface InfoRowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoRowVariants> {
  label: React.ReactNode;
  value: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
}

export function InfoRow({
  className,
  label,
  value,
  size,
  variant,
  labelClassName,
  valueClassName,
  ...props
}: InfoRowProps) {
  return (
    <div className={cn(infoRowVariants({ size, variant }), className)} {...props}>
      <span className={cn('text-foreground-secondary', labelClassName)}>{label}</span>
      <span className={cn('font-medium text-right', valueClassName)}>{value}</span>
    </div>
  );
}
