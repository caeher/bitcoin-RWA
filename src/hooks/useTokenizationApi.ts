import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import { asItemsResponse, mapAsset } from '@lib/apiMappers';
import type { 
  Asset, 
  AssetCreateRequest, 
  CursorPaginatedResponse,
} from '@types';

export const useTokenizationApi = () => {
  const queryClient = useQueryClient();

  const getAssets = (status?: string, category?: string, cursor?: string) => useQuery({
    queryKey: ['assets', status, category, cursor],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      if (cursor) params.append('cursor', cursor);
      const query = params.toString();
      return api
        .get<{ assets: any[]; next_cursor: string | null }>(`/tokenization/assets${query ? `?${query}` : ''}`)
        .then((response) => asItemsResponse(response.assets.map(mapAsset), response.next_cursor));
    },
  });

  const getAssetDetail = (assetId: string) => useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      const response = await api.get<{ asset: any }>(`/tokenization/assets/${assetId}`);
      return mapAsset(response.asset);
    },
    enabled: !!assetId,
  });

  const submitAsset = useMutation({
    mutationFn: async (data: AssetCreateRequest) => {
      const response = await api.post<{ asset: any }>('/tokenization/assets', data);
      return mapAsset(response.asset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });

  const evaluateAsset = useMutation({
    mutationFn: (assetId: string) =>
      api.post<{ message: string; estimated_completion: string }>(`/tokenization/assets/${assetId}/evaluate`),
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });

  const tokenizeAsset = useMutation({
    mutationFn: async (data: {
      assetId: string;
      total_supply: number;
      unit_price_sat: number;
      liquid_asset_id?: string;
      taproot_asset_id?: string;
    }) => {
      const response = await api.post<{ asset: any }>(`/tokenization/assets/${data.assetId}/tokenize`, {
        total_supply: data.total_supply,
        unit_price_sat: data.unit_price_sat,
        liquid_asset_id: data.liquid_asset_id,
        taproot_asset_id: data.taproot_asset_id,
      });

      return mapAsset(response.asset);
    },
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({ queryKey: ['asset', assetId.assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });

  const getLiquidInfo = () => useQuery({
    queryKey: ['liquidInfo'],
    queryFn: () => api.get<any>('/tokenization/liquid/info'),
  });

  return {
    getAssets,
    getAssetDetail,
    submitAsset,
    evaluateAsset,
    tokenizeAsset,
    getLiquidInfo,
  };
};
