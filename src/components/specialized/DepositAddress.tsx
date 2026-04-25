import { useQuery } from '@tanstack/react-query';
import { useWalletApi } from '@hooks/useWalletApi';
import { CopyButton } from './CopyButton';
import { BlockExplorerLink } from './BlockExplorerLink';
import { Skeleton } from '@components/ui';

export function DepositAddress() {
  const { createOnchainAddress, createBitcoinAddress } = useWalletApi();
  
  const { data: addressData, isLoading, error } = useQuery({
    queryKey: ['wallet-address'],
    queryFn: async () => {
      const [liquidAddress, bitcoinAddress] = await Promise.allSettled([
        createOnchainAddress.mutateAsync(),
        createBitcoinAddress.mutateAsync(),
      ]);

      return {
        liquidAddress: liquidAddress.status === 'fulfilled' ? liquidAddress.value.liquidAddress : undefined,
        liquidUnconfidentialAddress: liquidAddress.status === 'fulfilled' ? liquidAddress.value.liquidUnconfidentialAddress : undefined,
        bitcoinSegwitAddress: bitcoinAddress.status === 'fulfilled' ? bitcoinAddress.value.address : undefined,
      };
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

  const liquidAddress = addressData.liquidAddress;
  const bitcoinAddress = addressData.bitcoinSegwitAddress;

  return (
    <div className="p-4 bg-background-elevated rounded-lg border border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">
          Your Liquid Deposit Address
        </p>
        {liquidAddress && <CopyButton text={liquidAddress} size="sm" />}
      </div>
      {liquidAddress && (
        <div className="flex items-center gap-2 group">
          <code className="flex-1 font-mono text-sm text-accent-bitcoin break-all leading-relaxed">
            {liquidAddress}
          </code>
        </div>
      )}
      {bitcoinAddress && (
        <>
          <div className="mt-4 flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">
              Parallel Bitcoin SegWit Address
            </p>
            <CopyButton text={bitcoinAddress} size="sm" />
          </div>
          <div className="flex items-center gap-2 group">
            <code className="flex-1 font-mono text-sm text-foreground break-all leading-relaxed">
              {bitcoinAddress}
            </code>
          </div>
          <BlockExplorerLink type="address" value={bitcoinAddress} label="Open in Bitcoin explorer" className="mt-2 text-xs" mono={false} />
        </>
      )}
      <p className="mt-2 text-[10px] text-foreground-muted italic">
        * Liquid confidential addresses are shown without block explorer linkage. Bitcoin explorer is only enabled for the parallel SegWit address.
      </p>
    </div>
  );
}
