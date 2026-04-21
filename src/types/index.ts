// User types
export interface User {
  id: string;
  email: string;
  display_name?: string;
  role: 'user' | 'seller' | 'admin' | 'auditor';
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected' | 'expired';
  created_at: string;
  nostr_pubkey?: string;
  referral_code?: string;
  referred_by?: string;
}

export interface TokensOut {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokensOut;
}

// Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
  referral_code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface NostrSignedEvent {
  id: string;
  kind: number;
  created_at: number;
  content: string;
  tags: string[][];
  sig: string;
}

export interface NostrLoginRequest {
  pubkey: string;
  signed_event: NostrSignedEvent;
}


// Wallet types
export interface Wallet {
  id: string;
  user_id: string;
  onchain_balance_sats: number;
  lightning_balance_sats: number;
  pending_balance_sats: number;
  wallet_backend: 'software' | 'hsm';
  created_at: string;
}

export interface FeeEstimateResponse {
  fastest_fee: number;
  half_hour_fee: number;
  hour_fee: number;
  economy_fee: number;
  minimum_fee: number;
}

export interface Bolt11DecodeResponse {
  amount_sats: number;
  description: string;
  payee_pubkey: string;
  timestamp: string;
  expiry: number;
}

export interface FiatOnRampProviderStatus {
  id: string;
  name: string;
  logo_url: string;
  supported_fiat_currencies: string[];
  supported_countries: string[];
  requires_kyc: boolean;
  disabled_reason?: string;
}

export interface FiatOnRampSessionRequest {
  provider_id: string;
  amount_usd?: number;
  destination_currency?: string;
}

export interface TokenBalance {
  token_id: string;
  asset_name: string;
  asset_symbol: string;
  balance: number;
  value_sats: number;
  change_24h: number;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: 'deposit' | 'withdrawal' | 'ln_send' | 'ln_receive' | 'escrow_lock' | 'escrow_release' | 'fee';
  amount_sats: number;
  fee_sats: number;
  status: 'pending' | 'confirmed' | 'failed';
  txid?: string;
  address?: string;
  description?: string;
  created_at: string;
  confirmed_at?: string;
}

export interface CustodyStatusResponse {
  configured_backend: 'software' | 'hsm';
  wallet_backend: 'software' | 'hsm';
  signer_backend: 'software' | 'hsm';
  state: 'ready' | 'degraded';
  derivation_path: string;
  seed_exportable: boolean;
  withdraw_requires_2fa: boolean;
  server_compromise_impact: string;
  disclaimers: string[];
}

// Asset types
export interface AssetTokenOut {
  id: string;
  liquid_asset_id?: string;
  ticker: string;
  total_supply: number;
  unit_price_sats: number;
  market_cap_sats: number;
  minted_at: string;
  asset_group_key?: string;
}

export interface Asset {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  category: 'real_estate' | 'commodity' | 'invoice' | 'art' | 'other';
  status: 'pending' | 'evaluating' | 'approved' | 'rejected' | 'tokenized';
  valuation_sat: number;
  documents_url?: string;
  ai_score?: number;
  ai_analysis?: string;
  projected_roi?: number;
  token: AssetTokenOut | null;
  created_at: string;
  updated_at: string;
}

export interface AssetCreateRequest {
  name: string;
  description: string;
  category: 'real_estate' | 'commodity' | 'invoice' | 'art' | 'other';
  valuation_sat: number;
  documents_url?: string;
}

// Marketplace types
export interface Order {
  id: string;
  token_id: string;
  user_id: string;
  side: 'buy' | 'sell';
  quantity: number;
  price_sat: number;
  status: 'open' | 'partially_filled' | 'filled' | 'cancelled';
  filled_quantity: number;
  created_at: string;
}

export interface OrderCreateRequest {
  token_id: string;
  side: 'buy' | 'sell';
  quantity: number;
  price_sat: number;
}

export interface Trade {
  id: string;
  token_id: string;
  buyer_order_id: string;
  seller_order_id: string;
  buyer_id: string;
  seller_id: string;
  quantity: number;
  price_sat: number;
  total_sat: number;
  status: 'pending' | 'escrow_funded' | 'completed' | 'disputed';
  created_at: string;
  completed_at?: string;
}

export interface Escrow {
  id: string;
  trade_id: string;
  multisig_address: string;
  buyer_pubkey: string;
  seller_pubkey: string;
  platform_pubkey: string;
  amount_sat: number;
  platform_fee_sat: number;
  status: 'created' | 'funded' | 'released' | 'disputed' | 'refunded';
  funded_at?: string;
  released_at?: string;
  funding_txid?: string;
  release_txid?: string;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  last_price: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  order_count: number;
}

export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Education types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  modules: Module[];
  created_at: string;
  enrolled_count: number;
}

export interface Module {
  id: string;
  title: string;
  content: string;
  order_index: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percent: number;
  completed_modules: string[];
  enrolled_at: string;
  completed_at?: string;
}

// Treasury types
export interface TreasuryEntry {
  id: string;
  type: 'fee_collection' | 'disbursement' | 'donation';
  amount_sats: number;
  description: string;
  related_trade_id?: string;
  created_at: string;
  disbursement_reason?: string;
  recipient_address?: string;
}

export interface TreasurySummary {
  total_balance_sats: number;
  total_fees_collected_sats: number;
  total_disbursed_sats: number;
  education_fund_sats: number;
  last_updated: string;
}

// Admin types
export interface Dispute {
  id: string;
  trade_id: string;
  escrow_id: string;
  opened_by: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved_buyer' | 'resolved_seller' | 'resolved_split';
  evidence: string[];
  opened_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  resolved_by?: string;
}

export interface UserRoleUpdate {
  user_id: string;
  new_role: 'user' | 'seller' | 'admin' | 'auditor';
  reason: string;
}

// Referral types
export interface ReferralReward {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_sats: number;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface YieldAccrual {
  id: string;
  token_id: string;
  holder_id: string;
  amount_sats: number;
  period_start: string;
  period_end: string;
  paid_at: string;
}

// Onboarding types
export interface OnboardingSummary {
  custody_configured: boolean;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
  kyc_provider_required: boolean;
  fiat_onramp_ready: boolean;
  available_providers: FiatProvider[];
}

export interface FiatProvider {
  id: string;
  name: string;
  logo_url: string;
  supported_fiat_currencies: string[];
  supported_countries: string[];
  requires_kyc: boolean;
  disabled_reason?: string;
}

// API Response types
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  next_cursor: string | null;
}

// WebSocket types
export interface WebSocketMessage {
  type: 'price_update' | 'order_book_update' | 'trade_executed' | 'order_filled' | 'escrow_update';
  payload: unknown;
  timestamp: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoDismiss?: boolean;
  duration?: number;
  created_at: number;
}
