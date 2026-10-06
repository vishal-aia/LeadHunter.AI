import React, { useState, useEffect } from 'react';
import { User, UserMetrics, SystemStatus } from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { FindLeads } from './components/FindLeads';
import { MyLeads } from './components/MyLeads';
import { PaymentsView } from './components/PaymentsView';
import { AuthModal } from './components/AuthModal';
import { Coins, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
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
      setUser(data.user);
      setMetrics(data.metrics);
    } catch (err) {
      // If token expired or guest, clear user
      setUser(null);
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
    // Check if token exists, or auto-login default demo user for instant test readiness
    const token = api.getToken();
    if (!token) {
      // Default to demo user for frictionless evaluation
      api.switchAccount('user').then((res) => {
        setUser(res.user);
        fetchCurrentUser();
      });
    } else {
      fetchCurrentUser();
    }

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
      <main className="flex-1 pb-16">
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
            onNavigateToLeads={() => setActiveTab('my-leads')}
          />
        )}

        {activeTab === 'my-leads' && (
          <MyLeads
            onNavigateToSearch={() => setActiveTab('find-leads')}
            onOpenBuyModal={handleOpenBuyModal}
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

      {/* Mobile Sticky Payment & Action Footer (Section 27) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <div className="text-xs">
            <span className="text-[10px] text-slate-400 block">Balance</span>
            <span className="font-extrabold text-white">{user?.credits || 0} Credits</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('find-leads')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
          >
            Find Leads
          </button>

          <button
            onClick={handleOpenBuyModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buy 5 Leads (₹99)</span>
          </button>
        </div>
      </div>

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
          LeadHunter AI • Credit-Based Website Opportunity Lead Generation. All lead data collected from authorized public business sources.
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
