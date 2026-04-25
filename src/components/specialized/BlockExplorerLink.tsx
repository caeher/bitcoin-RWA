import { ExternalLink } from 'lucide-react';
import { getBlockExplorerUrl, type BlockExplorerEntity } from '@lib/blockExplorer';
import { cn, truncateAddress, truncateTxid } from '@lib/utils';

interface BlockExplorerLinkProps {
  type: BlockExplorerEntity;
  value?: string | null;
  label?: string;
  className?: string;
  truncate?: boolean;
  truncateChars?: number;
  mono?: boolean;
}

export function BlockExplorerLink({
  type,
  value,
  label,
  className,
  truncate = true,
  truncateChars = 6,
  mono = true,
}: BlockExplorerLinkProps) {
  if (!value) {
    return <span className={cn('text-foreground-secondary', className)}>{label || '--'}</span>;
  }

  const trimmedValue = value.trim();
  const displayValue = label
    || (!truncate
      ? trimmedValue
      : type === 'address'
        ? truncateAddress(trimmedValue, truncateChars)
        : truncateTxid(trimmedValue, truncateChars));

  return (
    <a
      href={getBlockExplorerUrl(type, trimmedValue)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-accent-bitcoin hover:underline',
        mono && 'font-mono',
        className
      )}
      title={`Open ${type} in block explorer`}
    >
      <span className="break-all">{displayValue}</span>
      <ExternalLink size={14} className="shrink-0" />
    </a>
  );
}
