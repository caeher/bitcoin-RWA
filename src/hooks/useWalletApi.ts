import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import {
  asItemsResponse,
  mapFiatProvider,
  mapTransaction,
  mapWallet,
} from '@lib/apiMappers';
import { normalizeWalletDepositAddresses } from '@lib/walletAddresses';
import type { 
  Wallet, 
  Transaction, 
  CustodyStatusResponse,
  CursorPaginatedResponse,
  FeeEstimateResponse,
  Bolt11DecodeResponse,
  FiatOnRampProviderStatus,
  FiatOnRampSessionRequest,
} from '@types';

export const useWalletApi = () => {
  const queryClient = useQueryClient();

  const getWalletSummary = () => useQuery({
    queryKey: ['walletSummary'],
    queryFn: async () => {
      const response = await api.get<{ wallet: any }>('/wallet');
      return mapWallet(response.wallet);
    },
  });

  const getCustodyStatus = () => useQuery({
    queryKey: ['custodyStatus'],
    queryFn: () => api.get<CustodyStatusResponse>('/wallet/custody'),
  });

  const getTransactions = (cursor?: string, type?: string) => useQuery({
    queryKey: ['transactions', cursor, type],
    queryFn: () => {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (type) params.append('type', type);
      const query = params.toString();
      return api
        .get<{ transactions: any[]; next_cursor: string | null }>(`/wallet/transactions${query ? `?${query}` : ''}`)
        .then((response) => asItemsResponse(response.transactions.map(mapTransaction), response.next_cursor));
    },
  });

  const getOnchainFees = () => useQuery({
    queryKey: ['onchainFees'],
    queryFn: () => api.get<FeeEstimateResponse>('/wallet/onchain/fees'),
  });

  const createOnchainAddress = useMutation({
    mutationFn: () =>
      api.post<Record<string, unknown>>('/wallet/onchain/address').then((response) => ({
        ...response,
        ...normalizeWalletDepositAddresses(response),
      })),
  });

  const createBitcoinAddress = useMutation({
    mutationFn: () =>
      api.post<{ address: string; type: 'bitcoin_segwit'; network: string }>('/wallet/bitcoin/address'),
  });

  const createInvoice = useMutation({
    mutationFn: (data: { amount_sats: number; description?: string }) =>
      api.post<{
        payment_request: string;
        payment_hash: string;
        amount_sats: number;
        memo?: string | null;
        expiry?: number;
      }>('/lightning/invoices', {
        amount_sats: data.amount_sats,
        memo: data.description,
      }),
  });

  const getInvoiceStatus = (rHash: string) => useQuery({
    queryKey: ['lightningInvoice', rHash],
    queryFn: () => api.get<any>(`/lightning/invoices/${rHash}`),
    enabled: !!rHash,
    refetchInterval: 5000,
  });

  const decodeBolt11 = useMutation({
    mutationFn: (paymentRequest: string) => 
      api.post<Bolt11DecodeResponse>('/lightning/decode', { payment_request: paymentRequest }),
  });

  const payInvoice = useMutation({
    mutationFn: (data: { payment_request: string }) => 
      api.post<{
        payment_hash: string;
        payment_preimage?: string | null;
        status: string;
        fee_sats?: number;
      }>('/lightning/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const withdrawOnchain = useMutation({
    mutationFn: (data: { address: string; amount_sats: number; fee_rate?: number }) =>
      api.post<{ txid: string; amount_sat: number; fee_sat: number; status: string }>('/wallet/onchain/withdraw', {
        address: data.address,
        amount_sat: data.amount_sats,
        fee_rate_sat_vb: data.fee_rate || 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const getFiatProviders = () => useQuery({
    queryKey: ['fiatProviders'],
    queryFn: async () => {
      const response = await api.get<{ providers: any[]; compliance_notices: string[] }>('/wallet/fiat/onramp/providers');

      return {
        providers: response.providers.map(mapFiatProvider),
        compliance_notices: response.compliance_notices,
      };
    },
  });

  const createFiatSession = useMutation({
    mutationFn: (data: FiatOnRampSessionRequest) => 
      api.post<{
        session_id: string;
        provider_id: string;
        state: string;
        handoff_url: string;
        deposit_address: string;
        destination_wallet_id: string;
        expires_at: string;
        disclaimer: string;
        compliance_action: string;
      }>('/wallet/fiat/onramp/session', data),
  });

  const getYieldSummary = () => useQuery({
    queryKey: ['walletYieldSummary'],
    queryFn: () => api.get<any>('/wallet/yield/summary'),
  });

  const getWalletQr = (address?: string, amountSats?: number) => useQuery({
    queryKey: ['walletQr', address, amountSats],
    queryFn: () => {
      const params = new URLSearchParams();
      if (address) params.append('address', address);
      if (amountSats) params.append('amount_sats', String(amountSats));
      const query = params.toString();
      return api.get<any>(`/wallet/qr${query ? `?${query}` : ''}`);
    },
  });

  const getPeginAddress = () => useQuery({
    queryKey: ['peginAddress'],
    queryFn: () => api.get<{
      mainchain_address: string;
      claim_script?: string;
      liquid_address?: string;
    }>('/wallet/pegin/address'),
  });

  const claimPegin = useMutation({
    mutationFn: (data: { mainchain_txid: string; vout: number; amount_sat?: number }) =>
      api.post<any>('/wallet/pegin/claim', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const pegout = useMutation({
    mutationFn: (data: { address: string; amount_sat: number; fee_rate_sat_vb?: number }) =>
      api.post<any>('/wallet/pegout', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    getWalletSummary,
    getCustodyStatus,
    getTransactions,
    getOnchainFees,
    createOnchainAddress,
    createBitcoinAddress,
    createInvoice,
    getInvoiceStatus,
    decodeBolt11,
    payInvoice,
    withdrawOnchain,
    getFiatProviders,
    createFiatSession,
    getYieldSummary,
    getWalletQr,
    getPeginAddress,
    claimPegin,
    pegout,
  };
};
