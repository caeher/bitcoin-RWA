import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import { mapUser } from '@lib/apiMappers';
import type { 
  ApiKey,
  ApiKeyCreateRequest,
  ApiKeyCreateResponse,
  AuthResponse, 
  LoginRequest, 
  ReferralSummaryResponse,
  RegisterRequest, 
  NostrLoginRequest,
  TwoFactorEnableResponse,
  User,
} from '@types';

export const useAuthApi = () => {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const register = useMutation({
    mutationFn: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const nostrLogin = useMutation({
    mutationFn: (data: NostrLoginRequest) => api.post<AuthResponse>('/auth/nostr', data),
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const logout = useMutation({
    mutationFn: (refreshToken?: string) =>
      api.post<{ message: string }>('/auth/logout', { refresh_token: refreshToken }),
    onSuccess: () => {
      queryClient.clear();
    }
  });

  const getCurrentUser = () => useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => mapUser(await api.get<User>('/auth/me')),
    retry: false,
  });

  const getKycStatus = () => useQuery({
    queryKey: ['kycStatus'],
    queryFn: async () => {
      const response = await api.get<{ kyc: { status: User['kyc_status'] } }>('/auth/kyc/status');
      return response.kyc;
    },
  });

  const submitKyc = useMutation({
    mutationFn: (data: { document_url?: string; notes?: string }) =>
      api.post<{ kyc: { status: User['kyc_status'] } }>('/auth/kyc/submit', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycStatus'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const getOnboardingSummary = () => useQuery({
    queryKey: ['onboardingSummary'],
    queryFn: async () => {
      const response = await api.get<{
        user: User;
        kyc_status: User['kyc_status'];
        custody: { state: string };
        fiat_onramp_providers: any[];
        compliance_notices: string[];
      }>('/auth/onboarding/summary');

      return {
        user: mapUser(response.user),
        kyc_status: response.kyc_status,
        custody_configured: response.custody?.state === 'ready',
        fiat_onramp_providers: response.fiat_onramp_providers,
        compliance_notices: response.compliance_notices || [],
      };
    },
  });

  const enableTwoFactor = useMutation({
    mutationFn: () => api.post<TwoFactorEnableResponse>('/auth/2fa/enable'),
  });

  const verifyTwoFactor = useMutation({
    mutationFn: (totpCode: string) =>
      api.post<void>('/auth/2fa/verify', { totp_code: totpCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['custodyStatus'] });
    },
  });

  const getApiKeys = () => useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const response = await api.get<{ keys: ApiKey[] }>('/auth/api-keys');
      return response.keys;
    },
  });

  const createApiKey = useMutation({
    mutationFn: (data: ApiKeyCreateRequest) =>
      api.post<ApiKeyCreateResponse>('/auth/api-keys', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });

  const revokeApiKey = useMutation({
    mutationFn: (keyId: string) => api.delete<{ message: string }>(`/auth/api-keys/${keyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });

  const rotateApiKey = useMutation({
    mutationFn: (keyId: string) =>
      api.patch<ApiKeyCreateResponse>(`/auth/api-keys/${keyId}/rotate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });

  const getReferralSummary = () => useQuery({
    queryKey: ['referralSummary'],
    queryFn: () => api.get<ReferralSummaryResponse>('/auth/referrals/summary'),
  });

  return {
    login,
    register,
    nostrLogin,
    logout,
    getCurrentUser,
    getKycStatus,
    submitKyc,
    getOnboardingSummary,
    enableTwoFactor,
    verifyTwoFactor,
    getApiKeys,
    createApiKey,
    revokeApiKey,
    rotateApiKey,
    getReferralSummary,
  };
};
