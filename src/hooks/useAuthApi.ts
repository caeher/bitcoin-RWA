import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  NostrLoginRequest,
  User,
} from '@types';

export const useAuthApi = () => {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const register = useMutation({
    mutationFn: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const nostrLogin = useMutation({
    mutationFn: (data: NostrLoginRequest) => api.post<AuthResponse>('/auth/nostr', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const logout = useMutation({
    mutationFn: () => api.post<{ message: string }>('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
    }
  });

  const getCurrentUser = () => useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.get<User>('/auth/me'),
    retry: false,
  });

  return {
    login,
    register,
    nostrLogin,
    logout,
    getCurrentUser,
  };
};
