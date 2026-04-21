import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import type { 
  Order, 
  OrderCreateRequest,
  OrderBook,
  Trade,
  Escrow,
  CursorPaginatedResponse,
} from '@types';

export const useMarketplaceApi = () => {
  const queryClient = useQueryClient();

  const getOrders = (tokenId?: string, side?: string, status?: string) => useQuery({
    queryKey: ['orders', tokenId, side, status],
    queryFn: () => {
      const params = new URLSearchParams();
      if (tokenId) params.append('token_id', tokenId);
      if (side) params.append('side', side);
      if (status) params.append('status', status);
      return api.get<CursorPaginatedResponse<Order>>(`/marketplace/orders?${params.toString()}`);
    },
  });

  const getOrderBook = (tokenId: string) => useQuery({
    queryKey: ['orderbook', tokenId],
    queryFn: () => api.get<OrderBook>(`/marketplace/orderbook/${tokenId}`),
    enabled: !!tokenId,
    refetchInterval: 5000,
  });

  const placeOrder = useMutation({
    mutationFn: (data: OrderCreateRequest) => api.post<Order>('/marketplace/orders', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderbook', variables.token_id] });
    }
  });

  const cancelOrder = useMutation({
    mutationFn: (orderId: string) => api.delete<{ status: string }>(`/marketplace/orders/${orderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderbook'] });
    }
  });

  const getEscrowDetails = (tradeId: string) => useQuery({
    queryKey: ['escrow', tradeId],
    queryFn: () => api.get<Escrow>(`/marketplace/escrows/${tradeId}`),
    enabled: !!tradeId,
  });

  const signEscrow = useMutation({
    mutationFn: (data: { trade_id: string, signature: string }) => 
      api.post<Escrow>(`/marketplace/escrows/${data.trade_id}/sign`, { signature: data.signature }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.trade_id] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    }
  });

  const getTradeHistory = (tokenId?: string, cursor?: string) => useQuery({
    queryKey: ['trades', tokenId, cursor],
    queryFn: () => {
      const params = new URLSearchParams();
      if (tokenId) params.append('token_id', tokenId);
      if (cursor) params.append('cursor', cursor);
      return api.get<CursorPaginatedResponse<Trade>>(`/marketplace/trades?${params.toString()}`);
    },
  });

  const createDispute = useMutation({
    mutationFn: (data: { trade_id: string, reason: string }) => 
      api.post<any>(`/marketplace/trades/${data.trade_id}/dispute`, { reason: data.reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.trade_id] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    }
  });

  return {
    getOrders,
    getOrderBook,
    placeOrder,
    cancelOrder,
    getEscrowDetails,
    signEscrow,
    getTradeHistory,
    createDispute,
  };
};
