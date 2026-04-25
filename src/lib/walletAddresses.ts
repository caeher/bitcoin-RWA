export interface WalletDepositAddressSet {
  liquidAddress?: string;
  liquidUnconfidentialAddress?: string;
  bitcoinSegwitAddress?: string;
  addressType?: string;
}

export function normalizeWalletDepositAddresses(raw?: Record<string, unknown> | null): WalletDepositAddressSet {
  if (!raw) {
    return {};
  }

  const liquidAddress = firstString(
    raw.address,
    raw.liquid_address,
    raw.confidential_address,
  );

  const liquidUnconfidentialAddress = firstString(
    raw.unconfidential_address,
    raw.unblinded_address,
  );

  const bitcoinSegwitAddress = firstString(
    raw.bitcoin_segwit_address,
    raw.bitcoin_address,
    raw.mainchain_address,
    raw.segwit_address,
    raw.btc_address,
  );

  const addressType = firstString(raw.type, raw.address_type);

  return {
    liquidAddress,
    liquidUnconfidentialAddress,
    bitcoinSegwitAddress,
    addressType,
  };
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}
