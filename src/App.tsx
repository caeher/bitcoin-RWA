import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores';
import { ToastContainer } from './components/specialized';
import { useAutoLogout } from './hooks';
import {
  Landing,
  Login,
  Register,
  Dashboard,
  Wallet,
  WalletDeposit,
  WalletWithdraw,
  Assets,
  AssetDetail,
  AssetSubmit,
  Marketplace,
  TokenTrading,
  Onboarding,
  Admin,
  ApiKeys,
  Settings,
  NostrCampaigns,
} from './pages';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function SellerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSeller } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isSeller()) {
    return <Navigate to="/assets" replace />;
  }

  return <>{children}</>;
}

// App content with auto-logout
function AppContent() {
  useAutoLogout({ timeoutMinutes: 15 });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Wallet routes */}
        <Route path="/wallet" element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        } />
        <Route path="/wallet/deposit" element={
          <ProtectedRoute>
            <WalletDeposit />
          </ProtectedRoute>
        } />
        <Route path="/wallet/withdraw" element={
          <ProtectedRoute>
            <WalletWithdraw />
          </ProtectedRoute>
        } />

        {/* Assets routes */}
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/assets/submit" element={
          <SellerRoute>
            <AssetSubmit />
          </SellerRoute>
        } />

        {/* Marketplace routes */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:tokenId" element={
          <ProtectedRoute>
            <TokenTrading />
          </ProtectedRoute>
        } />

        {/* Nostr campaigns */}
        <Route path="/campaigns" element={
          <ProtectedRoute>
            <NostrCampaigns />
          </ProtectedRoute>
        } />

        {/* Onboarding */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/api-keys" element={
          <ProtectedRoute>
            <ApiKeys />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-foreground-secondary mb-6">Page not found</p>
              <a href="/" className="text-accent-bitcoin hover:underline">
                Go back home
              </a>
            </div>
          </div>
        } />
      </Routes>

      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
