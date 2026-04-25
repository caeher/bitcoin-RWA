import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import { asItemsResponse, mapDispute, mapUser } from '@lib/apiMappers';
import type { 
  User, 
  UserRoleUpdate,
  Dispute,
  TreasurySummary,
  TreasuryEntry,
  CursorPaginatedResponse,
} from '@types';

export const useAdminApi = () => {
  const queryClient = useQueryClient();

  const getUsers = (role?: string, cursor?: string) => useQuery({
    queryKey: ['adminUsers', role, cursor],
    queryFn: () => {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (cursor) params.append('cursor', cursor);
      const query = params.toString();
      return api
        .get<{ users: any[]; next_cursor: string | null }>(`/admin/users${query ? `?${query}` : ''}`)
        .then((response) => asItemsResponse(response.users.map(mapUser), response.next_cursor));
    },
  });

  const updateUserRole = useMutation({
    mutationFn: (data: UserRoleUpdate) => 
      api.patch<User>(`/admin/users/${data.user_id}`, { role: data.new_role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });

  const disburseTreasury = useMutation({
    mutationFn: (data: { amount_sats: number; description: string }) =>
      api.post<{ entry: any }>('/admin/treasury/disburse', {
        amount_sat: data.amount_sats,
        description: data.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasurySummaryAdmin'] });
    }
  });

  const resolveDispute = useMutation({
    mutationFn: async (data: { trade_id: string; resolution: string; notes: string }) => {
      const response = await api.post<{ dispute: any }>(`/admin/escrows/${data.trade_id}/resolve`, {
        resolution: data.resolution,
        notes: data.notes,
      });

      return mapDispute(response.dispute);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDisputes'] });
    }
  });

  const getReferralSummary = () => useQuery({
    queryKey: ['adminReferralSummary'],
    queryFn: () => api.get<any>('/admin/referrals/summary'),
  });

  const getYieldSummary = () => useQuery({
    queryKey: ['adminYieldSummary'],
    queryFn: () => api.get<any>('/admin/yield/summary'),
  });

  const getReferralByUser = (userId: string) => useQuery({
    queryKey: ['adminReferralUser', userId],
    queryFn: () => api.get<any>(`/admin/referrals/${userId}`),
    enabled: !!userId,
  });

  const getYieldByUser = (userId: string) => useQuery({
    queryKey: ['adminYieldUser', userId],
    queryFn: () => api.get<any>(`/admin/yield/${userId}`),
    enabled: !!userId,
  });

  const getAdminKycList = (status?: string) => useQuery({
    queryKey: ['adminKycList', status],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      const query = params.toString();
      return api.get(`/auth/kyc/admin${query ? `?${query}` : ''}`);
    },
  });

  const updateKycStatus = useMutation({
    mutationFn: (data: { user_id: string, status: string, rejection_reason?: string, notes?: string }) => 
      api.put<any>(`/auth/kyc/admin/${data.user_id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminKycList'] });
    }
  });

  const getDisputes = (status?: string) => useQuery({
    queryKey: ['adminDisputes', status],
    enabled: false,
    queryFn: async () => asItemsResponse<Dispute>([]),
  });

  const getTreasuryLedger = () => useQuery({
    queryKey: ['treasuryLedger'],
    enabled: false,
    queryFn: async () => asItemsResponse<TreasuryEntry>([]),
  });

  const getTreasurySummary = () => useQuery({
    queryKey: ['treasurySummaryAdmin'],
    enabled: false,
    queryFn: async () => ({
      total_balance_sats: 0,
      total_fees_collected_sats: 0,
      total_disbursed_sats: 0,
      education_fund_sats: 0,
      last_updated: '',
    }),
  });

  return {
    getUsers,
    updateUserRole,
    disburseTreasury,
    getDisputes,
    resolveDispute,
    getTreasuryLedger,
    getTreasurySummary,
    getReferralSummary,
    getYieldSummary,
    getReferralByUser,
    getYieldByUser,
    getAdminKycList,
    updateKycStatus,
  };
};
