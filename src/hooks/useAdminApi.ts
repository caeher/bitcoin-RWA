import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
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
      return api.get<CursorPaginatedResponse<User>>(`/admin/users?${params.toString()}`);
    },
  });

  const updateUserRole = useMutation({
    mutationFn: (data: UserRoleUpdate) => 
      api.patch<User>(`/admin/users/${data.user_id}`, { new_role: data.new_role, reason: data.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });

  const disburseTreasury = useMutation({
    mutationFn: (data: { amount_sats: number, recipient_address: string, reason: string }) => 
      api.post<{ txid: string }>('/admin/treasury/disburse', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasurySummary'] });
    }
  });

  const resolveDispute = useMutation({
    mutationFn: (data: { trade_id: string, resolution: string, specific_amounts?: any }) => 
      api.post<Dispute>(`/admin/escrows/${data.trade_id}/resolve`, data),
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

  const getAdminKycList = (status?: string) => useQuery({
    queryKey: ['adminKycList', status],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      return api.get<CursorPaginatedResponse<any>>(`/auth/kyc/admin?${params.toString()}`);
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
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      return api.get<CursorPaginatedResponse<Dispute>>(`/admin/escrows/disputes?${params.toString()}`);
    },
  });

  const getTreasuryLedger = () => useQuery({
    queryKey: ['treasuryLedger'],
    queryFn: () => api.get<CursorPaginatedResponse<TreasuryEntry>>('/admin/treasury/ledger'),
  });

  const getTreasurySummary = () => useQuery({
    queryKey: ['treasurySummaryAdmin'],
    queryFn: () => api.get<TreasurySummary>('/admin/treasury/summary'),
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
    getAdminKycList,
    updateKycStatus,
  };
};
