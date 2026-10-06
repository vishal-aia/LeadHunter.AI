import React, { useState } from 'react';
import { User } from '../types';
import {
  Globe2,
  Coins,
  Search,
  FolderHeart,
  CreditCard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  UserCheck,
  Settings,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenBuyModal: () => void;
  onSwitchAccount: (role?: 'user') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenBuyModal,
  onSwitchAccount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Globe2 },
    { id: 'find-leads', label: 'Find Leads', icon: Search },
    { id: 'my-leads', label: 'My Leads', icon: FolderHeart },
    { id: 'payments', label: 'Pricing & Plans', icon: CreditCard },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300">
                LeadHunter<span className="text-emerald-400">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Find businesses that need a website</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Quick Buy CTA */}
              <button
                onClick={onOpenBuyModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unlock 5 Leads (₹99)</span>
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-[10px] text-slate-300 font-medium">Verified Buyer</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSwitchAccount('user');
                        }}
                        className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                        Reset / Reload Demo Account
                      </button>
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Sign In / Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBuyModal();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Buy 5 Leads (₹99)
            </button>

            {user ? (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2 bg-indigo-600 text-white font-semibold rounded text-xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
