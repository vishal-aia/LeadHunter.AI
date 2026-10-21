import React, { useState, useEffect } from 'react';
import { User, UserMetrics, SystemStatus } from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { FindLeads } from './components/FindLeads';
import { PaymentsView } from './components/PaymentsView';
import { AuthModal } from './components/AuthModal';
import { safeStorage } from './utils/storage';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = safeStorage.getItem('leadhunter_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {
      id: 'user_active_client',
      email: 'client@leadhunter.ai',
      name: 'Valued Client',
      country: 'India',
      credits: 100,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
  });
  const [metrics, setMetrics] = useState<UserMetrics>({
    availableCredits: 0,
    leadsPurchased: 0,
    leadsDelivered: 0,
    totalPaymentsCount: 0,
    totalSpent: 0,
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [buyCreditsTrigger, setBuyCreditsTrigger] = useState(false);

  // Initialize application and fetch current user profile
  const fetchCurrentUser = async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        try {
          safeStorage.setItem('leadhunter_user_profile', JSON.stringify(data.user));
        } catch {}
      }
      if (data?.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      // Keep existing non-null user state
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.error('Failed to get system status:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchSystemStatus();
  }, []);

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleSwitchAccount = async (role: 'user' = 'user') => {
    try {
      const res = await api.switchAccount(role);
      setUser(res.user);
      await fetchCurrentUser();
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Failed to switch test account:', err);
    }
  };

  const handleOpenBuyModal = () => {
    setActiveTab('payments');
    setBuyCreditsTrigger(true);
    setTimeout(() => setBuyCreditsTrigger(false), 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenBuyModal={handleOpenBuyModal}
        onSwitchAccount={handleSwitchAccount}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-8">
        {activeTab === 'dashboard' && (
          <>
            <Hero
              status={systemStatus}
              onGetLeads={handleOpenBuyModal}
              onExploreSearch={() => setActiveTab('find-leads')}
            />
            {user && (
              <Dashboard
                user={user}
                metrics={metrics}
                onNavigate={setActiveTab}
                onOpenBuyModal={handleOpenBuyModal}
              />
            )}
          </>
        )}

        {activeTab === 'find-leads' && (
          <FindLeads
            user={user}
            onRefreshUser={fetchCurrentUser}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            user={user}
            status={systemStatus}
            onRefreshUser={fetchCurrentUser}
            autoOpenCheckout={buyCreditsTrigger}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-4 text-slate-400 text-xs">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-white">Home</button>
          <span>•</span>
          <button onClick={() => setActiveTab('find-leads')} className="hover:text-white">Find Clients (Options)</button>
          <span>•</span>
          <button onClick={() => setActiveTab('my-leads')} className="hover:text-white">My Clients</button>
          <span>•</span>
          <button onClick={() => setActiveTab('payments')} className="hover:text-white">Pricing & Plans</button>
        </div>
        <p className="max-w-xl mx-auto text-[11px] text-slate-600">
          LeadHunter AI • Verified Business Opportunity Lead Generation for Web Designers & Agencies.
        </p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          fetchCurrentUser();
        }}
      />
    </div>
  );
}
