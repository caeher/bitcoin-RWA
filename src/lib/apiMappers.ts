import type {
  Asset,
  AssetTokenOut,
  CursorPaginatedResponse,
  Dispute,
  Escrow,
  FiatOnRampProviderStatus,
  Order,
  OrderBook,
  TokenBalance,
  Trade,
  Transaction,
  TreasuryEntry,
  User,
  Wallet,
} from '@types';

const buildTicker = (name?: string) => {
  const cleaned = (name || 'TKN')
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 4);

  return cleaned || 'TKN';
};

export const asItemsResponse = <T>(items: T[] | undefined, nextCursor?: string | null): CursorPaginatedResponse<T> => ({
  items: items || [],
  next_cursor: nextCursor ?? null,
});

export const mapUser = (raw: any): User => ({
  id: raw.id,
  email: raw.email ?? null,
  display_name: raw.display_name,
  role: raw.role,
  kyc_status: raw.kyc_status,
  created_at: raw.created_at,
  nostr_pubkey: raw.nostr_pubkey ?? undefined,
  referral_code: raw.referral_code ?? undefined,
  referred_by: raw.referred_by ?? undefined,
});

export const mapTokenBalance = (raw: any): TokenBalance => {
  const unitPrice = raw.unit_price_sat ?? raw.unit_price_sats ?? 0;
  const balance = raw.balance ?? 0;

  return {
    token_id: raw.token_id,
    liquid_asset_id: raw.liquid_asset_id ?? undefined,
    asset_name: raw.asset_name,
    asset_symbol: raw.symbol ?? buildTicker(raw.asset_name),
    balance,
    value_sats: balance * unitPrice,
    change_24h: 0,
    unit_price_sats: unitPrice,
    accrued_yield_sats: raw.accrued_yield_sat ?? 0,
  };
};

export const mapWallet = (raw: any): Wallet => {
  const onchain = raw.onchain_balance_sat ?? raw.onchain_balance_sats ?? 0;
  const lightning = raw.lightning_balance_sat ?? raw.lightning_balance_sats ?? 0;
  const totalValue = raw.total_value_sat ?? raw.total_value_sats ?? onchain + lightning;

  return {
    id: raw.id,
    user_id: raw.user_id ?? undefined,
    onchain_balance_sats: onchain,
    lightning_balance_sats: lightning,
    pending_balance_sats: raw.pending_balance_sat ?? raw.pending_balance_sats ?? 0,
    wallet_backend: raw.wallet_backend ?? 'software',
    created_at: raw.created_at ?? undefined,
    token_balances: (raw.token_balances || []).map(mapTokenBalance),
    total_value_sats: totalValue,
    total_yield_earned_sats: raw.total_yield_earned_sat ?? 0,
  };
};

export const mapTransaction = (raw: any): Transaction => {
  const amount = raw.amount_sat ?? raw.amount_sats ?? 0;
  const isOutbound = raw.direction === 'out';

  return {
    id: raw.id,
    wallet_id: raw.wallet_id ?? undefined,
    type: raw.type,
    amount_sats: isOutbound && amount > 0 ? -amount : amount,
    fee_sats: raw.fee_sat ?? raw.fee_sats ?? 0,
    status: raw.status,
    txid: raw.txHash ?? raw.txid ?? undefined,
    address: raw.address ?? undefined,
    description: raw.description ?? undefined,
    created_at: raw.created_at,
    confirmed_at: raw.confirmed_at ?? undefined,
    direction: raw.direction ?? undefined,
  };
};

export const mapFiatProvider = (raw: any): FiatOnRampProviderStatus => ({
  id: raw.provider_id ?? raw.id,
  name: raw.display_name ?? raw.name,
  logo_url: raw.logo_url ?? undefined,
  supported_fiat_currencies: raw.supported_fiat_currencies || [],
  supported_countries: raw.supported_countries || [],
  requires_kyc: raw.requires_kyc ?? false,
  disabled_reason: raw.state === 'unavailable' ? raw.disclaimer : undefined,
  state: raw.state,
  disclaimer: raw.disclaimer ?? undefined,
  external_handoff_url: raw.external_handoff_url ?? undefined,
});

export const mapAssetToken = (raw: any, assetName?: string): AssetTokenOut => {
  const totalSupply = raw.total_supply ?? 0;
  const unitPrice = raw.unit_price_sat ?? raw.unit_price_sats ?? 0;

  return {
    id: raw.id,
    liquid_asset_id: raw.liquid_asset_id ?? undefined,
    ticker: raw.ticker ?? raw.symbol ?? buildTicker(assetName),
    total_supply: totalSupply,
    circulating_supply: raw.circulating_supply ?? totalSupply,
    unit_price_sats: unitPrice,
    market_cap_sats: raw.market_cap_sats ?? totalSupply * unitPrice,
    minted_at: raw.minted_at,
    asset_group_key: raw.asset_group_key ?? raw.liquid_asset_id ?? undefined,
    issuance_metadata: raw.issuance_metadata ?? undefined,
  };
};

export const mapAsset = (raw: any): Asset => ({
  id: raw.id,
  owner_id: raw.owner_id,
  name: raw.name,
  description: raw.description,
  category: raw.category,
  status: raw.status,
  valuation_sat: raw.valuation_sat,
  documents_url: raw.documents_url ?? undefined,
  ai_score: raw.ai_score ?? undefined,
  ai_analysis:
    raw.ai_analysis == null
      ? undefined
      : typeof raw.ai_analysis === 'string'
      ? raw.ai_analysis
      : JSON.stringify(raw.ai_analysis),
  projected_roi: raw.projected_roi ?? undefined,
  token: raw.token ? mapAssetToken(raw.token, raw.name) : null,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
});

export const mapOrder = (raw: any): Order => ({
  id: raw.id,
  token_id: raw.token_id,
  user_id: raw.user_id ?? undefined,
  side: raw.side,
  order_type: raw.order_type ?? 'limit',
  quantity: raw.quantity,
  price_sat: raw.price_sat,
  trigger_price_sat: raw.trigger_price_sat ?? undefined,
  triggered_at: raw.triggered_at ?? undefined,
  is_triggered: raw.is_triggered ?? true,
  status: raw.status,
  filled_quantity: raw.filled_quantity ?? 0,
  created_at: raw.created_at,
});

export const mapOrderBook = (raw: any): OrderBook => {
  const bids = (raw.bids || []).map((level: any) => ({
    price: level.price_sat,
    quantity: level.total_quantity,
    total: level.price_sat * level.total_quantity,
    order_count: 1,
  }));
  const asks = (raw.asks || []).map((level: any) => ({
    price: level.price_sat,
    quantity: level.total_quantity,
    total: level.price_sat * level.total_quantity,
    order_count: 1,
  }));
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;

  return {
    token_id: raw.token_id,
    bids,
    asks,
    spread: bestBid && bestAsk ? bestAsk - bestBid : 0,
    last_price: raw.last_trade_price_sat ?? bestBid ?? bestAsk ?? 0,
    volume_24h: raw.volume_24h ?? 0,
  };
};

export const mapTrade = (raw: any): Trade => ({
  id: raw.id,
  token_id: raw.token_id,
  quantity: raw.quantity,
  price_sat: raw.price_sat,
  total_sat: raw.total_sat,
  fee_sat: raw.fee_sat ?? 0,
  status: raw.status,
  created_at: raw.created_at,
  completed_at: raw.settled_at ?? undefined,
});

export const mapEscrow = (raw: any): Escrow => ({
  id: raw.id,
  trade_id: raw.trade_id,
  multisig_address: raw.multisig_address,
  amount_sat: raw.locked_amount_sat ?? raw.amount_sat ?? 0,
  platform_fee_sat: raw.platform_fee_sat ?? 0,
  status: raw.status,
  funding_txid: raw.funding_txid ?? undefined,
  release_txid: raw.release_txid ?? undefined,
  refund_txid: raw.refund_txid ?? undefined,
  funded_at: raw.funded_at ?? undefined,
  released_at: raw.released_at ?? undefined,
  expires_at: raw.expires_at ?? undefined,
});

export const mapDispute = (raw: any): Dispute => ({
  id: raw.id,
  trade_id: raw.trade_id,
  escrow_id: raw.escrow_id ?? undefined,
  opened_by: raw.opened_by,
  reason: raw.reason,
  status: raw.status,
  evidence: raw.evidence ?? undefined,
  opened_at: raw.opened_at ?? raw.created_at,
  resolved_at: raw.resolved_at ?? undefined,
  resolution_notes: raw.notes ?? raw.resolution_notes ?? undefined,
  resolved_by: raw.resolved_by ?? undefined,
  resolution: raw.resolution ?? undefined,
  updated_at: raw.updated_at ?? undefined,
});

export const mapTreasuryEntry = (raw: any): TreasuryEntry => ({
  id: raw.id,
  type: raw.type,
  amount_sats: raw.amount_sat ?? raw.amount_sats ?? 0,
  description: raw.description ?? undefined,
  created_at: raw.created_at,
  related_trade_id: raw.related_trade_id ?? undefined,
  disbursement_reason: raw.disbursement_reason ?? undefined,
  recipient_address: raw.recipient_address ?? undefined,
  balance_after_sats: raw.balance_after_sat ?? undefined,
  reference_id: raw.reference_id ?? undefined,
});
