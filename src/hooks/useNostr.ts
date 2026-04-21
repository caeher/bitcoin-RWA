import { useState, useCallback } from 'react';
import type { NostrChallengeResponse, NostrSignedEvent } from '@types';
import { useNotificationStore } from '@stores';
import { api } from '@lib/api';

interface NostrExtension {
  getPublicKey(): Promise<string>;
  signEvent(event: Partial<NostrSignedEvent>): Promise<NostrSignedEvent>;
}

declare global {
  interface Window {
    nostr?: NostrExtension;
  }
}

export function useNostr() {
  const [isAvailable, setIsAvailable] = useState<boolean>(!!window.nostr);
  const { error } = useNotificationStore();

  const getPublicKey = useCallback(async (): Promise<string | null> => {
    if (!window.nostr) {
      error('Nostr extension not found', 'Please install a Nostr extension like nos2x or Alby.');
      return null;
    }
    try {
      return await window.nostr.getPublicKey();
    } catch (err) {
      console.error('Failed to get public key', err);
      // Don't show toast for user rejection
      return null;
    }
  }, [error]);

  const signLoginChallenge = useCallback(async (pubkey: string, challenge: string): Promise<NostrSignedEvent | null> => {
    if (!window.nostr) return null;
    
    const event = {
      kind: 22242,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: challenge,
      pubkey,
    };

    try {
      return await window.nostr.signEvent(event);
    } catch (err) {
      console.error('Failed to sign challenge', err);
      return null;
    }
  }, []);

  const fetchLoginChallenge = useCallback(async (): Promise<string | null> => {
    try {
      const response = await api.post<NostrChallengeResponse>(
        '/auth/nostr/challenge',
        undefined,
        { requireAuth: false, skipErrorToast: true }
      );

      if (response.kind !== 22242 || !response.challenge) {
        throw new Error('Invalid Nostr challenge response');
      }

      return response.challenge;
    } catch (err) {
      console.error('Failed to fetch Nostr challenge', err);
      error('Nostr login unavailable', 'Could not get a sign-in challenge from the server.');
      return null;
    }
  }, [error]);

  return {
    isAvailable,
    getPublicKey,
    fetchLoginChallenge,
    signLoginChallenge
  };
}
