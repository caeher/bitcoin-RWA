import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Bitcoin } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth, useNostr } from '@hooks';
import { useNotificationStore } from '@stores';

export function Login() {
  const location = useLocation();
  const { login, nostrLogin } = useAuth();
  const { isAvailable, getPublicKey, fetchLoginChallenge, signLoginChallenge } = useNostr();
  const { error: notifyError } = useNotificationStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login({ email, password }, from);
    
    if (!result.success && result.error) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleNostrLogin = async () => {
    if (!isAvailable) {
      notifyError('Nostr not available', 'Please install a Nostr extension like Alby or nos2x.');
      return;
    }
    
    setIsLoading(true);
    let pubkey;
    try {
      pubkey = await getPublicKey();
    } catch (e) {
      setIsLoading(false);
      return; // Canceled by user
    }
    
    if (!pubkey) {
      setIsLoading(false);
      return;
    }

    const challenge = await fetchLoginChallenge();
    if (!challenge) {
      setIsLoading(false);
      return;
    }
    
    const signedEvent = await signLoginChallenge(pubkey, challenge);
    if (!signedEvent) {
      notifyError('Signature failed', 'Could not sign the login challenge.');
      setIsLoading(false);
      return;
    }
    
    const result = await nostrLogin(pubkey, signedEvent, from);
    if (!result.success && result.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 data-grid opacity-20" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-bitcoin flex items-center justify-center">
              <Bitcoin className="text-background" size={28} />
            </div>
            <div>
              <h1 className="font-bold text-xl">RWA Platform</h1>
              <p className="text-xs text-foreground-secondary">Bitcoin Tokenization</p>
            </div>
          </Link>
        </div>

        {/* Login card */}
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
            <p className="text-foreground-secondary text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftElement={<Mail size={18} />}
              required
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftElement={<Lock size={18} />}
              isPassword
              required
            />

            {error && (
              <div className="p-3 rounded-md bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
              <ArrowRight size={18} />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background-surface px-4 text-xs text-foreground-secondary">
                Or continue with
              </span>
            </div>
          </div>

          {/* Nostr login */}
          <Button
            variant="outline"
            fullWidth
            size="lg"
            type="button"
            isLoading={isLoading}
            onClick={handleNostrLogin}
            disabled={!isAvailable}
            leftIcon={<span className="text-accent-bitcoin font-bold">⚡</span>}
          >
            {isAvailable ? 'Nostr Login' : 'Nostr Extension Not Found'}
          </Button>

          {/* Links */}
          <div className="mt-8 text-center space-y-3">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-accent-bitcoin hover:underline"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-foreground-secondary">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-accent-bitcoin hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
