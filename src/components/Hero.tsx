import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Coins,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { SystemStatus } from '../types';

interface HeroProps {
  status: SystemStatus | null;
  onGetLeads: () => void;
  onExploreSearch: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetLeads, onExploreSearch }) => {
  const [marketRegion, setMarketRegion] = React.useState<'india' | 'international'>('india');

  return (
    <div className="relative overflow-hidden pt-8 pb-16">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 shadow-sm backdrop-blur">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white">Live Proof:</span>
            <span>Over 1,280+ Local Businesses Verified With NO Official Website</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-emerald-400 font-semibold hidden sm:inline">100% Phone Verified</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Get High-Paying Clients Who <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              Need a Website Urgently
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Select your target country, industry (Doctor, Gym, Restaurant, Salon, etc.), and city. View proof of local businesses without official websites, pay securely, and immediately receive verified client contact details.
          </p>

          {/* Primary Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreSearch}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>CHOOSE OPTIONS & UNLOCK CLIENTS</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Server-Verified Razorpay Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Live Proof of Candidates Before Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Full Phone & Address Unmasked on Success</span>
            </div>
          </div>
        </div>

        {/* 3 CLIENT PACKAGES (Exact Pricing Requested) */}
        <div className="mt-14 max-w-5xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-white">Simple, Transparent Client Packages</h2>
            <p className="text-xs text-slate-400 mt-1">Pick your package, see live verified proof, and receive instant client delivery.</p>

            {/* Region Toggle (India vs Videsh / International) */}
            <div className="mt-5 inline-flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
              <button
                type="button"
                onClick={() => setMarketRegion('india')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  marketRegion === 'india'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇮🇳 Indian Clients (From ₹99)</span>
              </button>
              <button
                type="button"
                onClick={() => setMarketRegion('international')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  marketRegion === 'international'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🌐 Videsh / International (From ₹149)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Package 1: 5 Clients - ₹99 (India) / ₹149 (Videsh) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {marketRegion === 'india' ? 'Starter Pack' : 'Global Starter'}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  5 {marketRegion === 'india' ? 'Verified Clients' : 'International Clients'}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-emerald-400">
                    ₹{marketRegion === 'india' ? '99' : '149'}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({marketRegion === 'india' ? '₹19.8' : '₹29.8'} / client)
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>5 High-Intent {marketRegion === 'india' ? 'Local' : 'Global'} Businesses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Verified: No Official Website Found</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct Click-to-Call Phone Numbers</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onExploreSearch}
                className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Select 5 Clients (₹{marketRegion === 'india' ? '99' : '149'})
              </button>
            </div>

            {/* Package 2: 10 Clients - ₹170 (India) / ₹249 (Videsh) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-900 border-2 border-emerald-400 shadow-xl shadow-emerald-500/10 relative flex flex-col justify-between">
              <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                MOST POPULAR
              </span>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {marketRegion === 'india' ? 'Growth Pack' : 'Global Growth'}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  10 {marketRegion === 'india' ? 'Verified Clients' : 'International Clients'}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-emerald-400">
                    ₹{marketRegion === 'india' ? '170' : '249'}
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold">
                    {marketRegion === 'india' ? 'Save ₹28 (₹17 / client)' : 'Save ₹49 (₹24.9 / client)'}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>10 High-Intent {marketRegion === 'india' ? 'Local' : 'Global'} Businesses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full Phone & Address Unmasked</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Downloadable CSV / Excel List</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onExploreSearch}
                className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition"
              >
                Select 10 Clients (₹{marketRegion === 'india' ? '170' : '249'})
              </button>
            </div>

            {/* Package 3: 20 Clients - ₹300 (India) / ₹429 (Videsh) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between relative">
              <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white shadow-md">
                BEST VALUE
              </span>

              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {marketRegion === 'india' ? 'Agency Pack' : 'Global Agency Pack'}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  20 {marketRegion === 'india' ? 'Verified Clients' : 'International Clients'}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    ₹{marketRegion === 'india' ? '300' : '429'}
                  </span>
                  <span className="text-xs text-indigo-300 font-semibold">
                    {marketRegion === 'india' ? 'Save ₹96 (₹15 / client)' : 'Save ₹167 (₹21.45 / client)'}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>20 High-Intent {marketRegion === 'india' ? 'Local' : 'Global'} Businesses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Best Per-Lead Pricing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Permanent Lifetime Access</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onExploreSearch}
                className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Select 20 Clients (₹{marketRegion === 'india' ? '300' : '429'})
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-12 max-w-3xl mx-auto p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Privacy & Source Notice:</span> Lead information is collected from publicly available business sources. 'No website found' means an official website was not found in the sources checked; it does not guarantee that the business has never had a website.
          </p>
        </div>
      </div>
    </div>
  );
};
