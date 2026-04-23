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
  const { login: storeLogin, logout: storeLogout, setLoading, setTwoFactorPending } = useAuthStore();
  const { success, error } = useNotificationStore();
  const { setWallet } = useWalletStore();

  const login = useCallback(async (credentials: LoginCredentials, redirectTo = '/dashboard') => {
    try {
      setLoading(true);
      
      // Check if 2FA is required (mock)
      const requires2FA = false; // This would come from the API
      
      if (requires2FA) {
        setTwoFactorPending(true, credentials.email);
        navigate('/auth/2fa');
        return { success: false, requires2FA: true };
      }

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
  }, [navigate, storeLogin, setLoading, setTwoFactorPending, success, error, queryClient]);

  const verify2FA = useCallback(async (code: string, redirectTo = '/dashboard') => {
    try {
      setLoading(true);
      
      // Mock 2FA verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, verify code with API
      const isValid = code === '123456'; // Mock valid code
      
      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      const { twoFactorToken } = useAuthStore.getState();
      const response = await api.post<AuthResponse>('/auth/login', { email: twoFactorToken || '', password: '' });
      
      queryClient.clear();
      storeLogin(mapUser(response.user), response.tokens);
      success('Welcome back!', '2FA verification successful');
      
      navigate(redirectTo);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : '2FA verification failed';
      error('Verification failed', message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [navigate, storeLogin, setLoading, success, error, queryClient]);

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
