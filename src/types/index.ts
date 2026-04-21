// User types
export interface User {
  id: string;
  email?: string | null;
  display_name: string;
  role: 'user' | 'seller' | 'admin' | 'auditor';
  kyc_status?: 'none' | 'pending' | 'verified' | 'rejected' | 'expired';
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
  referrer_code?: string;
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
  pubkey?: string;
}

export interface NostrLoginRequest {
  pubkey: string;
  signed_event: NostrSignedEvent;
}

export interface NostrChallengeResponse {
  challenge: string;
  kind: 22242;
  expires_in: number;
}


// Wallet types
export interface Wallet {
  id: string;
  user_id?: string;
  onchain_balance_sats: number;
  lightning_balance_sats: number;
  pending_balance_sats: number;
  wallet_backend: 'software' | 'hsm';
  created_at?: string;
  token_balances?: TokenBalance[];
  total_value_sats?: number;
  total_yield_earned_sats?: number;
}

export interface FeeEstimateResponse {
  fastest_fee: number;
  half_hour_fee: number;
  hour_fee: number;
  economy_fee: number;
  minimum_fee: number;
}

export interface Bolt11DecodeResponse {
  payment_hash: string;
  amount_sats?: number | null;
  amount_msat?: number | null;
  description?: string | null;
  description_hash?: string | null;
  payee_pubkey?: string | null;
  timestamp: string;
  created_at?: string;
  expiry: number;
  expires_at?: string;
  destination?: string | null;
  fallback_address?: string | null;
  network?: string;
  is_expired?: boolean;
}

export interface FiatOnRampProviderStatus {
  id: string;
  name: string;
  logo_url?: string;
  supported_fiat_currencies: string[];
  supported_countries: string[];
  requires_kyc: boolean;
  disabled_reason?: string;
  state?: 'ready' | 'pending_redirect' | 'kyc_required' | 'limited' | 'unavailable';
  disclaimer?: string;
  external_handoff_url?: string;
}

export interface FiatOnRampSessionRequest {
  provider_id: string;
  fiat_currency: string;
  fiat_amount: number;
  country_code: string;
  return_url: string;
  cancel_url: string;
}

export interface TokenBalance {
  token_id: string;
  asset_name: string;
  asset_symbol: string;
  balance: number;
  value_sats: number;
  change_24h: number;
  liquid_asset_id?: string;
  unit_price_sats?: number;
  accrued_yield_sats?: number;
}

export interface Transaction {
  id: string;
  wallet_id?: string;
  type: 'deposit' | 'withdrawal' | 'ln_send' | 'ln_receive' | 'escrow_lock' | 'escrow_release' | 'fee';
  amount_sats: number;
  fee_sats: number;
  status: 'pending' | 'confirmed' | 'failed';
  txid?: string;
  address?: string;
  description?: string;
  created_at: string;
  confirmed_at?: string;
  direction?: 'in' | 'out';
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
  circulating_supply?: number;
  unit_price_sats: number;
  market_cap_sats: number;
  minted_at: string;
  asset_group_key?: string;
  issuance_metadata?: Record<string, unknown> | null;
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
  user_id?: string;
  side: 'buy' | 'sell';
  quantity: number;
  price_sat: number;
  order_type?: 'limit' | 'stop_limit';
  trigger_price_sat?: number | null;
  triggered_at?: string | null;
  is_triggered?: boolean;
  status: 'open' | 'partially_filled' | 'filled' | 'cancelled';
  filled_quantity: number;
  created_at: string;
}

export interface OrderCreateRequest {
  token_id: string;
  side: 'buy' | 'sell';
  order_type?: 'limit' | 'stop_limit';
  quantity: number;
  price_sat: number;
  trigger_price_sat?: number | null;
}

export interface Trade {
  id: string;
  token_id: string;
  buyer_order_id?: string;
  seller_order_id?: string;
  buyer_id?: string;
  seller_id?: string;
  quantity: number;
  price_sat: number;
  total_sat: number;
  fee_sat?: number;
  status: 'pending' | 'escrowed' | 'settled' | 'disputed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export interface Escrow {
  id: string;
  trade_id: string;
  multisig_address: string;
  buyer_pubkey?: string;
  seller_pubkey?: string;
  platform_pubkey?: string;
  amount_sat: number;
  platform_fee_sat: number;
  status: 'created' | 'funded' | 'inspection_pending' | 'released' | 'disputed' | 'refunded' | 'expired';
  funded_at?: string;
  released_at?: string;
  funding_txid?: string;
  release_txid?: string;
  refund_txid?: string;
  expires_at?: string;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  last_price: number;
  token_id?: string;
  volume_24h?: number;
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
  description?: string;
  related_trade_id?: string;
  created_at: string;
  disbursement_reason?: string;
  recipient_address?: string;
  balance_after_sats?: number;
  reference_id?: string | null;
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
  escrow_id?: string;
  opened_by: string;
  reason: string;
  status: 'open' | 'resolved';
  evidence?: string[];
  opened_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolution?: string | null;
  updated_at?: string;
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

export interface TwoFactorEnableResponse {
  totp_uri: string;
  backup_codes: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at?: string | null;
  expires_at?: string | null;
  revoked: boolean;
  created_at: string;
}

export interface ApiKeyCreateRequest {
  name: string;
  scopes: string[];
  expires_at?: string | null;
}

export interface ApiKeyCreateResponse extends ApiKey {
  key: string;
}

export interface ReferredUserOut {
  id: string;
  email?: string | null;
  display_name: string;
  created_at: string;
}

export interface ReferralRewardOut {
  id: string;
  referred_user_id: string;
  referred_display_name: string;
  referred_email?: string | null;
  reward_type: 'signup_bonus';
  amount_sat: number;
  status: 'credited' | 'reversed';
  eligibility_event?: string | null;
  credited_at?: string | null;
  created_at: string;
}

export interface ReferralSummaryResponse {
  referral_code: string;
  referrals_count: number;
  total_reward_sat: number;
  referred_users: ReferredUserOut[];
  rewards: ReferralRewardOut[];
}

export type CampaignFundingMode = 'intraledger' | 'external';
export type CampaignStatus =
  | 'draft'
  | 'funding_pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'exhausted'
  | 'cancelled'
  | 'failed';

export interface CampaignTriggerIn {
  trigger_type: 'hashtag' | 'tag' | 'content_substring' | 'author_pubkey' | 'event_kind';
  operator?: 'equals' | 'contains' | 'in';
  value: string;
  case_sensitive?: boolean;
}

export interface CampaignTriggerOut extends CampaignTriggerIn {
  id: string;
  operator: 'equals' | 'contains' | 'in';
  case_sensitive: boolean;
  created_at: string;
}

export interface CampaignFundingOut {
  id: string;
  funding_mode: CampaignFundingMode;
  amount_sat: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  payment_hash?: string | null;
  payment_request?: string | null;
  confirmed_at?: string | null;
  created_at?: string | null;
}

export interface CampaignOut {
  id: string;
  name: string;
  status: CampaignStatus;
  funding_mode: CampaignFundingMode;
  reward_amount_sat: number;
  budget_total_sat: number;
  budget_reserved_sat: number;
  budget_spent_sat: number;
  budget_refunded_sat: number;
  max_rewards_per_user: number;
  start_at?: string | null;
  end_at?: string | null;
  created_at: string;
  updated_at: string;
  triggers?: CampaignTriggerOut[];
  fundings?: CampaignFundingOut[];
}

export interface CampaignCreateRequest {
  name: string;
  funding_mode: CampaignFundingMode;
  reward_amount_sat: number;
  budget_total_sat: number;
  max_rewards_per_user?: number;
  start_at?: string | null;
  end_at?: string | null;
  triggers: CampaignTriggerIn[];
}

export interface CampaignMatchOut {
  id: string;
  relay_url: string;
  event_id: string;
  event_pubkey: string;
  event_kind: number;
  match_fingerprint: string;
  status: 'matched' | 'ignored' | 'reserved' | 'paid' | 'failed';
  ignore_reason?: string | null;
  created_at: string;
}

export interface CampaignPayoutOut {
  id: string;
  match_id: string;
  recipient_pubkey: string;
  amount_sat: number;
  fee_sat?: number | null;
  payment_hash?: string | null;
  status: 'pending' | 'succeeded' | 'failed';
  failure_reason?: string | null;
  created_at: string;
  settled_at?: string | null;
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
