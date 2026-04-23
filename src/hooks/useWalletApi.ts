import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import {
  asItemsResponse,
  mapFiatProvider,
  mapTransaction,
  mapWallet,
} from '@lib/apiMappers';
import type { 
  Wallet, 
  Transaction, 
  CustodyStatusResponse,
  TokenBalance,
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
    mutationFn: () => api.post<{ address: string; unconfidential_address: string; type: string }>('/wallet/onchain/address'),
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

  return {
    getWalletSummary,
    getCustodyStatus,
    getTransactions,
    getOnchainFees,
    createOnchainAddress,
    createInvoice,
    decodeBolt11,
    payInvoice,
    withdrawOnchain,
    getFiatProviders,
    createFiatSession,
  };
};
