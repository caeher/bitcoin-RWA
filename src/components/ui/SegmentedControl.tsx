import { cn } from '@lib/utils';
import type { ReactNode } from 'react';

type SegmentedControlVariant = 'soft' | 'solid';
type SegmentedControlSize = 'sm' | 'md';

export interface SegmentedControlOption<TValue extends string = string> {
  value: TValue;
  label: ReactNode;
  disabled?: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
}

export interface SegmentedControlProps<TValue extends string = string> {
  value: TValue;
  onChange: (value: TValue) => void;
  options: ReadonlyArray<SegmentedControlOption<TValue>>;
  variant?: SegmentedControlVariant;
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  className?: string;
}

const containerVariants: Record<SegmentedControlVariant, string> = {
  soft: 'rounded-lg bg-background-elevated p-1',
  solid: 'rounded-xl bg-background-elevated/80 p-1',
};

const sizeVariants: Record<SegmentedControlSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm font-medium',
};

const selectedVariants: Record<SegmentedControlVariant, string> = {
  soft: 'bg-accent-bitcoin/15 text-accent-bitcoin shadow-sm',
  solid: 'bg-background-surface text-foreground shadow-sm',
};

const unselectedVariants: Record<SegmentedControlVariant, string> = {
  soft: 'text-foreground-secondary hover:text-foreground',
  solid: 'text-foreground-secondary hover:text-foreground',
};

export function SegmentedControl<TValue extends string = string>({
  value,
  onChange,
  options,
  variant = 'soft',
  size = 'md',
  fullWidth = false,
  className,
}: SegmentedControlProps<TValue>) {
  return (
    <div className={cn('inline-flex gap-1', containerVariants[variant], fullWidth && 'w-full', className)}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              fullWidth && 'flex-1',
              sizeVariants[size],
              isActive ? selectedVariants[variant] : unselectedVariants[variant],
              isActive ? option.activeClassName : option.inactiveClassName
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}