import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useNotificationStore, useWalletStore } from '@stores';
import type { User } from '@types';
import { mapUser } from '@lib/apiMappers';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  display_name: string;
  referralCode?: string;
}

import { api } from '@lib/api';
import type { AuthResponse } from '@types';

export function useAuth() {
  const navigate = useNavigate();
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

      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
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
  }, [navigate, storeLogin, setLoading, setTwoFactorPending, success, error]);

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
  }, [navigate, storeLogin, setLoading, success, error]);

  const register = useCallback(async (data: RegisterData, redirectTo = '/onboarding') => {
    try {
      setLoading(true);
      
      const response = await api.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
        display_name: data.display_name,
        referrer_code: data.referralCode,
      });
      
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
  }, [navigate, storeLogin, setLoading, success, error]);

  const nostrLogin = useCallback(async (pubkey: string, signedEvent: any, redirectTo = '/dashboard') => {
    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/auth/nostr', { pubkey, signed_event: signedEvent });
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
  }, [navigate, storeLogin, setLoading, success, error]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = useAuthStore.getState().session?.refresh_token;
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (e) {
      // Ignore errors on logout
    }
    storeLogout();
    setWallet(null);
    success('Logged out', 'You have been logged out successfully');
    navigate('/');
  }, [storeLogout, setWallet, success, navigate]);

  return {
    login,
    nostrLogin,
    register,
    logout,
    verify2FA,
  };
}
