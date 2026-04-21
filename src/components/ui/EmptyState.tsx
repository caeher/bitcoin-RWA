import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

const emptyStateVariants = cva('flex flex-col items-center text-center', {
  variants: {
    variant: {
      page: 'py-16',
      card: 'py-8',
      inline: 'py-4',
    },
    tone: {
      neutral: '',
      info: '',
      success: '',
      warning: '',
      danger: '',
    },
  },
  defaultVariants: {
    variant: 'page',
    tone: 'neutral',
  },
});

const iconToneClasses = {
  neutral: 'bg-background-elevated text-foreground-secondary',
  info: 'bg-accent-blue/10 text-accent-blue',
  success: 'bg-accent-green/10 text-accent-green',
  warning: 'bg-accent-bitcoin/10 text-accent-bitcoin',
  danger: 'bg-accent-red/10 text-accent-red',
};

interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  variant,
  tone = 'neutral',
  icon,
  title,
  description,
  action,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn(emptyStateVariants({ variant, tone }), className)} {...props}>
      {icon && (
        <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl', iconToneClasses[tone])}>
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-foreground-secondary mt-1">{description}</p>
      )}
      {children}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
