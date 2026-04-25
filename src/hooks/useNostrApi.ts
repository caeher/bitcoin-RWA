import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import type {
  CampaignCreateRequest,
  CampaignFundingOut,
  CampaignMatchOut,
  CampaignOut,
  CampaignPayoutOut,
} from '@types';

export const useNostrApi = () => {
  const queryClient = useQueryClient();

  const getCampaigns = () => useQuery({
    queryKey: ['nostrCampaigns'],
    queryFn: () => api.get<CampaignOut[]>('/nostr/campaigns'),
  });

  const getCampaign = (campaignId: string) => useQuery({
    queryKey: ['nostrCampaign', campaignId],
    queryFn: () => api.get<CampaignOut>(`/nostr/campaigns/${campaignId}`),
    enabled: !!campaignId,
  });

  const getCampaignMatches = (campaignId: string) => useQuery({
    queryKey: ['nostrCampaignMatches', campaignId],
    queryFn: () => api.get<CampaignMatchOut[]>(`/nostr/campaigns/${campaignId}/matches`),
    enabled: !!campaignId,
  });

  const getCampaignPayouts = (campaignId: string) => useQuery({
    queryKey: ['nostrCampaignPayouts', campaignId],
    queryFn: () => api.get<CampaignPayoutOut[]>(`/nostr/campaigns/${campaignId}/payouts`),
    enabled: !!campaignId,
  });

  const createCampaign = useMutation({
    mutationFn: (data: CampaignCreateRequest) =>
      api.post<CampaignOut>('/nostr/campaigns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nostrCampaigns'] });
    },
  });

  const fundCampaignIntraledger = useMutation({
    mutationFn: (data: { campaignId: string; amount_sat: number }) =>
      api.post<CampaignOut>(`/nostr/campaigns/${data.campaignId}/fund/intraledger`, {
        amount_sat: data.amount_sat,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nostrCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['nostrCampaign', variables.campaignId] });
    },
  });

  const fundCampaignExternal = useMutation({
    mutationFn: (data: { campaignId: string; amount_sat: number }) =>
      api.post<CampaignFundingOut>(`/nostr/campaigns/${data.campaignId}/fund/external`, {
        amount_sat: data.amount_sat,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nostrCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['nostrCampaign', variables.campaignId] });
    },
  });

  const activateCampaign = useMutation({
    mutationFn: (campaignId: string) =>
      api.post<CampaignOut>(`/nostr/campaigns/${campaignId}/activate`),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['nostrCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['nostrCampaign', campaignId] });
    },
  });

  const pauseCampaign = useMutation({
    mutationFn: (campaignId: string) =>
      api.post<CampaignOut>(`/nostr/campaigns/${campaignId}/pause`),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['nostrCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['nostrCampaign', campaignId] });
    },
  });

  const cancelCampaign = useMutation({
    mutationFn: (campaignId: string) =>
      api.post<CampaignOut>(`/nostr/campaigns/${campaignId}/cancel`),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['nostrCampaigns'] });
      queryClient.invalidateQueries({ queryKey: ['nostrCampaign', campaignId] });
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: (data: { title?: string; content: string; tags?: string[]; publish_at?: string | null }) =>
      api.post<any>('/nostr/announcements', data),
  });

  return {
    getCampaigns,
    getCampaign,
    getCampaignMatches,
    getCampaignPayouts,
    createCampaign,
    fundCampaignIntraledger,
    fundCampaignExternal,
    activateCampaign,
    pauseCampaign,
    cancelCampaign,
    createAnnouncement,
  };
};
