import { useQuery } from '@tanstack/react-query';
import { useWalletApi } from '@hooks/useWalletApi';
import { CopyButton } from './CopyButton';
import { BlockExplorerLink } from './BlockExplorerLink';
import { Wallet } from 'lucide-react';
import { Skeleton } from '@components/ui';

export function WalletAddressWidget() {
  const { createOnchainAddress, createBitcoinAddress } = useWalletApi();
  
  const { data: addressData, isLoading } = useQuery({
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
    // Keep it indefinitely once loaded
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background-elevated rounded-full border border-border w-40">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-bitcoin animate-pulse" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  if (!addressData) return null;

  const liquidAddress = addressData.liquidAddress;
  const bitcoinAddress = addressData.bitcoinSegwitAddress;
  const primaryAddress = bitcoinAddress || liquidAddress;

  if (!primaryAddress) return null;

  const truncatedAddress = `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-6)}`;

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-background-elevated/50 backdrop-blur-sm rounded-full border border-border hover:border-accent-bitcoin/40 transition-all group shadow-sm">
      <div className="flex items-center gap-2 max-w-[140px] md:max-w-none">
        <Wallet size={12} className="text-accent-bitcoin shrink-0" />
        <span className="text-[11px] font-mono text-foreground-secondary group-hover:text-foreground transition-colors truncate">
          {truncatedAddress}
        </span>
      </div>
      {bitcoinAddress && (
        <>
          <div className="w-px h-3 bg-border shrink-0" />
          <BlockExplorerLink
            type="address"
            value={bitcoinAddress}
            label=""
            className="text-foreground-secondary hover:text-accent-bitcoin"
            mono={false}
            truncate={false}
          />
        </>
      )}
      <div className="w-px h-3 bg-border shrink-0" />
      <CopyButton 
        text={primaryAddress} 
        size="sm" 
        className="p-0 text-foreground-secondary hover:bg-transparent" 
      />
    </div>
  );
}
