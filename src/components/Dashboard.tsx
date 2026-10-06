import React from 'react';
import { User, UserMetrics } from '../types';
import {
  Coins,
  ShoppingBag,
  Send,
  CreditCard,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  FolderHeart,
} from 'lucide-react';

interface DashboardProps {
  user: User;
  metrics: UserMetrics;
  onNavigate: (tab: string) => void;
  onOpenBuyModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, metrics, onNavigate, onOpenBuyModal }) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Lead Agency Member
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {user.country}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-indigo-300">{user.name}</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Discover local businesses with missing or non-functional websites, verify public phone numbers, and unlock high-converting web design clients.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <button
              onClick={onOpenBuyModal}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>BUY 5 LEADS (₹99)</span>
            </button>

            <button
              onClick={() => onNavigate('find-leads')}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>FIND CLIENTS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-200 mb-4">Quick Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: UNLOCK 5 CLIENTS */}
          <div
            onClick={onOpenBuyModal}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="font-bold text-white text-sm">UNLOCK 5 CLIENTS</h3>
            <p className="text-xs text-slate-400 mt-1">Get 5 verified local business clients ready for your website pitch.</p>
          </div>

          {/* Action 2: FIND CLIENTS */}
          <div
            onClick={() => onNavigate('find-leads')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                <Search className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="font-bold text-white text-sm">FIND CLIENTS</h3>
            <p className="text-xs text-slate-400 mt-1">Natural language query or city + category search engine.</p>
          </div>

          {/* Action 3: MY LEADS */}
          <div
            onClick={() => onNavigate('my-leads')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition">
                <FolderHeart className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="font-bold text-white text-sm">MY LEADS</h3>
            <p className="text-xs text-slate-400 mt-1">Access delivered leads, call contacts, and export to CSV.</p>
          </div>

          {/* Action 4: PRICING & PACKAGES */}
          <div
            onClick={() => onNavigate('payments')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                <CreditCard className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="font-bold text-white text-sm">PRICING & PACKAGES</h3>
            <p className="text-xs text-slate-400 mt-1">Affordable pay-as-you-go packages starting from ₹99.</p>
          </div>
        </div>
      </div>

      {/* Platform Value Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Verified No Website</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every business is filtered for missing or broken websites so you only pitch businesses that actually need your services.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Real Phone Numbers</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct public business phone numbers ready for immediate WhatsApp outreach, SMS, or phone calls.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <FolderHeart className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Lifetime Lead Storage</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All clients you unlock remain permanently accessible in your account forever with one-click CSV export.
          </p>
        </div>
      </div>
    </div>
  );
};
