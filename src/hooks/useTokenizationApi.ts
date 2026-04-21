import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
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
      return api.get<CursorPaginatedResponse<Asset>>(`/tokenization/assets?${params.toString()}`);
    },
  });

  const getAssetDetail = (assetId: string) => useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => api.get<Asset>(`/tokenization/assets/${assetId}`),
    enabled: !!assetId,
  });

  const submitAsset = useMutation({
    mutationFn: (data: AssetCreateRequest) => api.post<Asset>('/tokenization/assets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });

  const evaluateAsset = useMutation({
    mutationFn: (assetId: string) => api.post<Asset>(`/tokenization/assets/${assetId}/evaluate`),
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });

  const tokenizeAsset = useMutation({
    mutationFn: (assetId: string) => api.post<Asset>(`/tokenization/assets/${assetId}/tokenize`),
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
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
