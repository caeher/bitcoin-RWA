const DEFAULT_BLOCK_EXPLORER_URL = 'https://block-explorer.cuboplus.caeher.com';

export type BlockExplorerEntity = 'tx' | 'block' | 'address';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getBlockExplorerBaseUrl(): string {
  const envValue = (import.meta.env.VITE_BLOCK_EXPLORER_URL as string | undefined)?.trim();
  return trimTrailingSlash(envValue || DEFAULT_BLOCK_EXPLORER_URL);
}

export function getBlockExplorerUrl(type: BlockExplorerEntity, value: string): string {
  const normalizedValue = value.trim();
  return `${getBlockExplorerBaseUrl()}/${type}/${normalizedValue}`;
}

export function isLikelyTxid(value?: string | null): value is string {
  return !!value && /^[a-fA-F0-9]{64}$/.test(value.trim());
}

export function isLikelyBlockHash(value?: string | null): value is string {
  return isLikelyTxid(value);
}

export function isLikelyBitcoinAddress(value?: string | null): value is string {
  if (!value) return false;

  const normalized = value.trim();
  return /^(bc1|tb1|bcrt1|1|3|m|n|2)[a-zA-Z0-9]{20,90}$/.test(normalized);
}
