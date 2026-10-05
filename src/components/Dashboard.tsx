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

      {/* 4 Metric Cards (Section 2 & 17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Available Lead Credits */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between group hover:border-slate-700 transition">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Lead Credits</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-400">{user.credits}</span>
              <span className="text-xs text-slate-400">credits</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {user.credits > 0 ? `${user.credits} credits ready to unlock` : 'Payment required for each new client batch'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Leads Purchased */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between group hover:border-slate-700 transition">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads Purchased</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-indigo-300">{metrics.leadsPurchased}</span>
              <span className="text-xs text-slate-400">total</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across verified payments</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Leads Delivered */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between group hover:border-slate-700 transition">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads Delivered</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-teal-300">{metrics.leadsDelivered}</span>
              <span className="text-xs text-slate-400">leads</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Saved in My Leads repository</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Send className="w-6 h-6" />
          </div>
        </div>

        {/* Total Payments */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between group hover:border-slate-700 transition">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Payments</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-purple-300">₹{metrics.totalSpent}</span>
              <span className="text-xs text-slate-400">({metrics.totalPaymentsCount} orders)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Server verified transactions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Action Grid (Section 17) */}
      <div>
        <h2 className="text-base font-bold text-slate-200 mb-4">Quick Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: BUY 5 LEADS */}
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
            <h3 className="font-bold text-white text-sm">BUY 5 LEADS</h3>
            <p className="text-xs text-slate-400 mt-1">Top up your balance instantly via Razorpay for ₹99.</p>
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

          {/* Action 4: PAYMENT HISTORY */}
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
            <h3 className="font-bold text-white text-sm">PAYMENT HISTORY</h3>
            <p className="text-xs text-slate-400 mt-1">Check verified orders, signatures, and credit ledger.</p>
          </div>
        </div>
      </div>

      {/* Account Info Details Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security & Account Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">User Account ID</span>
            <span className="font-mono text-slate-200 truncate block mt-0.5">{user.id}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Registered Email</span>
            <span className="font-medium text-slate-200 truncate block mt-0.5">{user.email}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Member Since</span>
            <span className="font-medium text-slate-200 block mt-0.5">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Payment Rule</span>
            <span className="font-semibold text-emerald-400 block mt-0.5">1 Payment = 1 Batch (Zero Free Access)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
