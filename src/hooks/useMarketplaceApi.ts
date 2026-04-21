import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import {
  asItemsResponse,
  mapDispute,
  mapEscrow,
  mapOrder,
  mapOrderBook,
  mapTrade,
} from '@lib/apiMappers';
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
      const query = params.toString();
      return api
        .get<{ orders: any[]; next_cursor?: string | null }>(`/marketplace/orders${query ? `?${query}` : ''}`)
        .then((response) => asItemsResponse(response.orders.map(mapOrder), response.next_cursor));
    },
  });

  const getOrderBook = (tokenId: string) => useQuery({
    queryKey: ['orderbook', tokenId],
    queryFn: async () => {
      const response = await api.get<any>(`/marketplace/orderbook/${tokenId}`);
      return mapOrderBook(response);
    },
    enabled: !!tokenId,
    refetchInterval: 5000,
  });

  const placeOrder = useMutation({
    mutationFn: async (data: OrderCreateRequest) => {
      const response = await api.post<{ order: any }>('/marketplace/orders', data);
      return mapOrder(response.order);
    },
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
    queryFn: async () => {
      const response = await api.get<{ escrow: any }>(`/marketplace/escrows/${tradeId}`);
      return mapEscrow(response.escrow);
    },
    enabled: !!tradeId,
  });

  const signEscrow = useMutation({
    mutationFn: async (data: { trade_id: string; pset?: string }) => {
      const response = await api.post<{ escrow: any }>(`/marketplace/escrows/${data.trade_id}/sign`, {
        pset: data.pset,
      });
      return mapEscrow(response.escrow);
    },
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
      const query = params.toString();
      return api
        .get<{ trades: any[]; next_cursor?: string | null }>(`/marketplace/trades${query ? `?${query}` : ''}`)
        .then((response) => asItemsResponse(response.trades.map(mapTrade), response.next_cursor));
    },
  });

  const createDispute = useMutation({
    mutationFn: async (data: { trade_id: string; reason: string }) => {
      const response = await api.post<{ dispute: any }>(`/marketplace/trades/${data.trade_id}/dispute`, {
        reason: data.reason,
      });
      return mapDispute(response.dispute);
    },
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
