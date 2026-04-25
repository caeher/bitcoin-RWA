import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useNotificationStore, useWalletStore } from '@stores';
import type { AuthResponse, NostrLoginRequest, NostrSignedEvent, User } from '@types';
import { mapUser } from '@lib/apiMappers';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  display_name: string;
}

import { api } from '@lib/api';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login: storeLogin, logout: storeLogout, setLoading } = useAuthStore();
  const { success, error } = useNotificationStore();
  const { setWallet } = useWalletStore();

  const login = useCallback(async (credentials: LoginCredentials, redirectTo = '/dashboard') => {
    try {
      setLoading(true);

      const response = await api.post<AuthResponse>('/auth/login', credentials, { requireAuth: false });
      
      queryClient.clear();
      storeLogin(mapUser(response.user), response.tokens);
      success('Welcome back!', `Logged in as ${response.user.email || response.user.display_name}`);
      
      navigate(redirectTo);
      return { success: true, requires2FA: false };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      error('Login failed', message);
      return { success: false, requires2FA: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin, setLoading, success, error, queryClient]);

  const verify2FA = useCallback(async (code: string, redirectTo = '/dashboard') => {
    try {
      setLoading(true);

      await api.post<void>('/auth/2fa/verify', { totp_code: code });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      success('2FA verified', 'Your TOTP code was accepted.');
      navigate(redirectTo);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '2FA verification failed';
      error('Verification failed', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, setLoading, success, error, queryClient]);

  const register = useCallback(async (data: RegisterData, redirectTo = '/wallet') => {
    try {
      setLoading(true);
      
      const response = await api.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
        display_name: data.display_name,
      }, { requireAuth: false });
      
      queryClient.clear();
      storeLogin(mapUser(response.user), response.tokens);
      success('Account created!', 'Welcome to RWA Platform');
      
      navigate(redirectTo);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      error('Registration failed', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin, setLoading, success, error, queryClient]);

  const nostrLogin = useCallback(async (pubkey: string, signedEvent: NostrSignedEvent, redirectTo = '/dashboard') => {
    try {
      setLoading(true);
      const payload: NostrLoginRequest = { pubkey, signed_event: signedEvent };
      const response = await api.post<AuthResponse>('/auth/nostr', payload, { requireAuth: false });
      
      queryClient.clear();
      storeLogin(mapUser(response.user), response.tokens);
      success('Welcome back!', `Logged in with Nostr`);
      navigate(redirectTo);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nostr login failed';
      error('Login failed', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin, setLoading, success, error, queryClient]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = useAuthStore.getState().session?.refresh_token;
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (e) {
      // Ignore errors on logout
    }
    queryClient.clear();
    storeLogout();
    setWallet(null);
    success('Logged out', 'You have been logged out successfully');
    navigate('/');
  }, [storeLogout, setWallet, success, navigate, queryClient]);

  return {
    login,
    nostrLogin,
    register,
    logout,
    verify2FA,
  };
}
