import { useQuery } from '@tanstack/react-query';
import { useWalletApi } from '@hooks/useWalletApi';
import { CopyButton } from './CopyButton';
import { cn } from '@lib/utils';
import { Skeleton } from '@components/ui';

export function DepositAddress() {
  const { createOnchainAddress } = useWalletApi();
  
  const { data: addressData, isLoading, error } = useQuery({
    queryKey: ['wallet-address'],
    queryFn: async () => {
      // The guide suggests calling the endpoint that creates or gets the address
      const response = await createOnchainAddress.mutateAsync();
      return response;
    },
    // We use staleTime to avoid re-generating/fetching too often
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-background-elevated rounded-lg border border-border">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (error || !addressData) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className="p-4 bg-background-elevated rounded-lg border border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">
          Your Liquid Deposit Address
        </p>
        <CopyButton text={addressData.address} size="sm" />
      </div>
      <div className="flex items-center gap-2 group">
        <code className="flex-1 font-mono text-sm text-accent-bitcoin break-all leading-relaxed">
          {addressData.address}
        </code>
      </div>
      <p className="mt-2 text-[10px] text-foreground-muted italic">
        * This address supports confidential Liquid assets.
      </p>
    </div>
  );
}
