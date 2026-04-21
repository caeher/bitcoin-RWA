import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

const sectionHeaderVariants = cva('flex gap-4', {
  variants: {
    layout: {
      default: 'flex-col md:flex-row md:items-center md:justify-between',
      compact: 'items-center justify-between',
      centered: 'flex-col items-center text-center',
    },
    spacing: {
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      none: '',
    },
  },
  defaultVariants: {
    layout: 'default',
    spacing: 'none',
  },
});

const sectionHeaderTitleVariants = cva('font-bold text-foreground', {
  variants: {
    size: {
      sm: 'text-xl',
      md: 'text-2xl',
      lg: 'text-3xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof sectionHeaderVariants>,
    VariantProps<typeof sectionHeaderTitleVariants> {
  title: React.ReactNode;
  description?: React.ReactNode;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}

export function SectionHeader({
  className,
  title,
  description,
  leading,
  actions,
  meta,
  layout,
  spacing,
  size,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn(sectionHeaderVariants({ layout, spacing }), className)} {...props}>
      <div className={cn('flex gap-3', layout === 'centered' ? 'flex-col items-center' : 'items-start')}>
        {leading && <div className="shrink-0">{leading}</div>}
        <div className={cn(layout === 'centered' && 'text-center')}>
          <div className={cn('flex items-center gap-3', layout === 'centered' && 'justify-center')}>
            <h1 className={sectionHeaderTitleVariants({ size })}>{title}</h1>
            {meta}
          </div>
          {description && (
            <p className="text-foreground-secondary mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className={cn('flex items-center gap-2', layout === 'centered' && 'justify-center')}>
          {actions}
        </div>
      )}
    </div>
  );
}
