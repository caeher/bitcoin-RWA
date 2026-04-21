import { useState, useCallback } from 'react';
import type { NostrSignedEvent } from '@types';
import { useNotificationStore } from '@stores';

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

  const signLoginChallenge = useCallback(async (pubkey: string): Promise<NostrSignedEvent | null> => {
    if (!window.nostr) return null;
    
    // Create the challenge event (NIP-98 based approach, though simplified for login)
    // using kind 22242 (client authentication)
    const event = {
      kind: 22242,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['relay', 'wss://nostr.example.com'], // Or the platform's relay
        ['challenge', `login-${Date.now()}`]
      ],
      content: 'Login to CUBO Platform',
      pubkey,
    };

    try {
      return await window.nostr.signEvent(event);
    } catch (err) {
      console.error('Failed to sign challenge', err);
      return null;
    }
  }, []);

  return {
    isAvailable,
    getPublicKey,
    signLoginChallenge
  };
}
