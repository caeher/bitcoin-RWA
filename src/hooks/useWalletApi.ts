import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
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
    queryFn: () => api.get<Wallet>('/wallet'),
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
      return api.get<CursorPaginatedResponse<Transaction>>(`/wallet/transactions?${params.toString()}`);
    },
  });

  const getOnchainFees = () => useQuery({
    queryKey: ['onchainFees'],
    queryFn: () => api.get<FeeEstimateResponse>('/wallet/onchain/fees'),
  });

  const createOnchainAddress = useMutation({
    mutationFn: () => api.post<{ address: string }>('/wallet/onchain/address'),
  });

  const createInvoice = useMutation({
    mutationFn: (data: { amount_sats: number, description?: string }) => 
      api.post<{ payment_request: string, payment_hash: string }>('/wallet/lightning/invoices', data),
  });

  const decodeBolt11 = useMutation({
    mutationFn: (paymentRequest: string) => 
      api.post<Bolt11DecodeResponse>('/wallet/lightning/decode', { payment_request: paymentRequest }),
  });

  const payInvoice = useMutation({
    mutationFn: (data: { payment_request: string }) => 
      api.post<{ status: string }>('/wallet/lightning/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const withdrawOnchain = useMutation({
    mutationFn: (data: { address: string, amount_sats: number, fee_rate?: number }) => 
      api.post<{ txid: string }>('/wallet/onchain/withdraw', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const getFiatProviders = () => useQuery({
    queryKey: ['fiatProviders'],
    queryFn: () => api.get<{ providers: FiatOnRampProviderStatus[], compliance_notices: string[] }>('/wallet/fiat/onramp/providers'),
  });

  const createFiatSession = useMutation({
    mutationFn: (data: FiatOnRampSessionRequest) => 
      api.post<{ session_id: string, provider_id: string, status: string, next_action: { type: string, url: string } }>('/wallet/fiat/onramp/session', data),
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
