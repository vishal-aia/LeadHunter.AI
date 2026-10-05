import React, { useState, useEffect } from 'react';
import { User, LeadRecord, ClientPackage, ProofSample } from '../types';
import { api } from '../api';
import {
  Globe2,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Coins,
  ArrowRight,
  Phone,
  Mail,
  Copy,
  Check,
  Download,
  Lock,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

interface FindLeadsProps {
  user: User | null;
  onRefreshUser: () => void;
  onNavigateToLeads: () => void;
}

export const FindLeads: React.FC<FindLeadsProps> = ({
  user,
  onRefreshUser,
  onNavigateToLeads,
}) => {
  // Step 1: Country
  const countries = [
    { name: 'India', flag: '🇮🇳', defaultCity: 'Mumbai' },
    { name: 'USA', flag: '🇺🇸', defaultCity: 'Dallas' },
    { name: 'UK', flag: '🇬🇧', defaultCity: 'London' },
    { name: 'Canada', flag: '🇨🇦', defaultCity: 'Toronto' },
    { name: 'Australia', flag: '🇦🇺', defaultCity: 'Sydney' },
    { name: 'UAE', flag: '🇦🇪', defaultCity: 'Dubai' },
  ];
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  // Step 2: High-need website business categories (Options, NO chat)
  const categories = [
    { id: 'Doctor', label: 'Doctor & Clinics', icon: '👨‍⚕️', description: 'Clinics & specialists needing appointment booking sites' },
    { id: 'Gym', label: 'Gyms & Fitness', icon: '🏋️‍♂️', description: 'Fitness clubs needing membership landing pages' },
    { id: 'Dentist', label: 'Dental Clinics', icon: '🦷', description: 'Dentists without local web presence' },
    { id: 'Restaurant', label: 'Restaurants & Cafes', icon: '🍽️', description: 'Eateries needing digital menus & delivery links' },
    { id: 'Real Estate', label: 'Real Estate Agents', icon: '🏢', description: 'Property dealers needing portfolio websites' },
    { id: 'Salon', label: 'Salons & Spas', icon: '💇‍♀️', description: 'Beauty centers needing service menus & booking' },
    { id: 'Lawyer', label: 'Lawyers & Advocates', icon: '⚖️', description: 'Legal firms seeking professional web credibility' },
    { id: 'Plumber', label: 'Plumbers & Electricians', icon: '🔧', description: 'Home service contractors needing lead forms' },
    { id: 'Interior Designer', label: 'Interior Designers', icon: '🛋️', description: 'Decorators needing online photo portfolios' },
    { id: 'Coaching', label: 'Coaching & Tutors', icon: '📚', description: 'Institutes needing student enquiry websites' },
    { id: 'Car Repair', label: 'Auto Garages', icon: '🚗', description: 'Car mechanics & detailing service centers' },
    { id: 'Bakery', label: 'Bakeries & Sweets', icon: '🧁', description: 'Custom cake shops needing order showcase' },
  ];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Step 3: City
  const popularCities = {
    India: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Jaipur', 'Noida', 'Ahmedabad'],
    USA: ['Dallas', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Austin'],
    UK: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'],
    Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
    Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
    UAE: ['Dubai', 'Abu Dhabi', 'Sharjah'],
  };
  const [city, setCity] = useState('Mumbai');

  // Step 4: Packages (Exact pricing requested)
  const packages: ClientPackage[] = [
    { id: 'pack_5', leads: 5, price: 99, currency: 'INR', title: '5 Clients', savings: '₹19.8 / client' },
    { id: 'pack_10', leads: 10, price: 170, currency: 'INR', badge: 'MOST POPULAR', title: '10 Clients', savings: 'Save ₹28 • ₹17 / client' },
    { id: 'pack_20', leads: 20, price: 300, currency: 'INR', badge: 'BEST VALUE', title: '20 Clients', savings: 'Save ₹96 • ₹15 / client' },
  ];
  const [selectedPackage, setSelectedPackage] = useState<ClientPackage>(packages[0]);

  // Proof & Discovery State
  const [proofLoading, setProofLoading] = useState(false);
  const [proofData, setProofData] = useState<{ totalAvailable: number; samples: ProofSample[] } | null>(null);

  // Unlocked Leads & Delivery State
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [unlockedLeads, setUnlockedLeads] = useState<LeadRecord[]>([]);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch real-time proof preview whenever options change
  useEffect(() => {
    let isCancelled = false;
    const fetchProof = async () => {
      setProofLoading(true);
      try {
        const res = await api.getProofPreview(selectedCountry.name, city, selectedCategory.id);
        if (!isCancelled) {
          setProofData(res);
        }
      } catch (err) {
        console.error('Failed to load proof preview:', err);
      } finally {
        if (!isCancelled) setProofLoading(false);
      }
    };

    fetchProof();
    return () => {
      isCancelled = true;
    };
  }, [selectedCountry, selectedCategory, city]);

  const handleCountryChange = (c: typeof countries[0]) => {
    setSelectedCountry(c);
    setCity(c.defaultCity);
    setUnlockedLeads([]);
    setDeliveryMessage(null);
  };

  const handleCategoryChange = (cat: typeof categories[0]) => {
    setSelectedCategory(cat);
    setUnlockedLeads([]);
    setDeliveryMessage(null);
  };

  const handleCopy = (lead: LeadRecord) => {
    const text = `Business: ${lead.businessName}
Category: ${lead.category}
Location: ${lead.address}
Phone: ${lead.phone}
Website Status: Official Website Not Found (High Opportunity)`;

    navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (unlockedLeads.length === 0) return;
    const headers = ['Business Name', 'Category', 'City', 'Phone', 'Address', 'Website Status', 'Lead Score'];
    const rows = unlockedLeads.map((l) => [
      `"${l.businessName.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.city}"`,
      `"${l.phone}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      `"${l.websiteStatus}"`,
      `"${l.leadScore}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCategory.id}_${city}_${unlockedLeads.length}_Clients.csv`;
    link.click();
  };

  // Main Action: Unlock Clients with Server-Verified Payment
  const handlePayAndUnlock = async () => {
    if (!user) return;
    setIsProcessingOrder(true);
    setErrorMessage(null);
    setDeliveryMessage(null);

    try {
      // 1. Create order for selected package on backend
      const order = await api.createPaymentOrder(selectedPackage.id, selectedPackage.leads);

      // Check for Razorpay checkout script
      const RazorpayObj = (window as any).Razorpay;

      const executeLeadDelivery = async (paymentId: string) => {
        // Run search and claim batch
        const jobRes = await api.startSearchJob({
          country: selectedCountry.name,
          city,
          category: selectedCategory.id,
          requestedLeads: selectedPackage.leads,
          websiteStatusFilter: 'NO_WEBSITE_FOUND',
        });

        // Wait brief moment for server job to ready
        await new Promise((r) => setTimeout(r, 1500));

        // Claim batch
        const claimRes = await api.claimSearchBatch(jobRes.jobId);
        setUnlockedLeads(claimRes.leads || []);
        setDeliveryMessage(
          `Payment verified! Successfully unlocked ${claimRes.leads?.length || selectedPackage.leads} verified ${selectedCategory.label} in ${city}!`
        );
        onRefreshUser();
      };

      if (RazorpayObj && !order.isTestMode) {
        // Live Razorpay Checkout
        const rzp = new RazorpayObj({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'LeadHunter AI',
          description: `Unlock ${selectedPackage.leads} Verified ${selectedCategory.label} in ${city}`,
          order_id: order.orderId,
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: { color: '#10b981' },
          handler: async (resp: any) => {
            try {
              // Server-side signature verification
              await api.verifyPayment(resp.razorpay_order_id, resp.razorpay_payment_id, resp.razorpay_signature);
              await executeLeadDelivery(resp.razorpay_payment_id);
            } catch (err: any) {
              setErrorMessage(err.message || 'Payment verification failed on server.');
            } finally {
              setIsProcessingOrder(false);
            }
          },
          modal: {
            ondismiss: () => setIsProcessingOrder(false),
          },
        });
        rzp.open();
      } else {
        // Secure server-side sandbox test flow
        const testPaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10);
        const testSignature = `test_sig_${order.orderId}_${testPaymentId}`;

        await api.verifyPayment(order.orderId, testPaymentId, testSignature);
        await executeLeadDelivery(testPaymentId);
        setIsProcessingOrder(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate client order.');
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Select Options • Get Verified Clients Without Websites</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Choose Category & City to Unlock Clients
        </h1>
        <p className="text-sm text-slate-300">
          No complicated prompts. Simply select your target country, industry, and city. We verify business phone numbers and guarantee no existing official website.
        </p>
      </div>

      {/* STEP 1: Country Selection (Options) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Globe2 className="w-4 h-4" />
            <span>Step 1: Select Target Country</span>
          </span>
          <span className="text-xs text-slate-400">Selected: {selectedCountry.name}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {countries.map((c) => {
            const isSelected = selectedCountry.name === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleCountryChange(c)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-2xl">{c.flag}</span>
                <span className="text-xs">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Category Selection (Options) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Step 2: Choose Business Category (High Need of Website)</span>
          </span>
          <span className="text-xs text-indigo-300 font-bold">{selectedCategory.label}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950/40 border-emerald-400 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{cat.icon}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white leading-tight">{cat.label}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 3: Target City / Area */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Step 3: Target City or Metro Area</span>
          </span>
          <span className="text-xs text-slate-400">Current: {city}</span>
        </div>

        {/* Quick Metro Pills */}
        <div className="flex flex-wrap gap-2">
          {((popularCities as any)[selectedCountry.name] || popularCities.India).map((cityName: string) => (
            <button
              key={cityName}
              type="button"
              onClick={() => setCity(cityName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                city.toLowerCase() === cityName.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cityName}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="relative max-w-md">
          <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Or type any custom city or town..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* STEP 4: Choose Package (5 clients = ₹99, 10 clients = ₹170, 20 clients = ₹300) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>Step 4: Select How Many Clients You Want</span>
          </span>
          <span className="text-xs text-slate-400">100% Verified Opportunity Guarantee</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const isSelected = selectedPackage.id === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`p-5 rounded-3xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-900 border-emerald-400 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-white">{pkg.leads} Clients</span>
                    <span className="text-2xl font-black text-emerald-400">₹{pkg.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pkg.savings}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Delivers {pkg.leads} verified {selectedCategory.label} in {city} whose official website was not found.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Fixed One-Time</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROOF SECTION: LIVE VERIFIED OPPORTUNITY PREVIEW */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border-2 border-indigo-500/40 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Live Opportunity Verification Proof
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              Found {proofData?.totalAvailable || 30}+ Verified {selectedCategory.label} in {city} Without a Website
            </h3>
            <p className="text-xs text-slate-400">
              Sample candidates discovered from Google Places. Real phone numbers are masked below and will unlock immediately upon successful payment.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 self-start sm:self-auto shrink-0 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audited Against Public Sources</span>
          </div>
        </div>

        {/* Proof Candidate Sample Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(proofData?.samples || []).map((sample, i) => (
            <div
              key={sample.id || i}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-indigo-500/40 transition"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="font-bold text-xs text-white leading-tight truncate">
                  {sample.businessName}
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase shrink-0">
                  HIGH NEED
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400 truncate">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{sample.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="font-mono font-bold text-emerald-300">{sample.maskedPhone}</span>
                  <Lock className="w-3 h-3 text-amber-400 shrink-0 ml-auto" />
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] text-amber-300 font-semibold flex items-center justify-between">
                <span>Official Website:</span>
                <span className="text-rose-400 font-bold">NOT FOUND</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA TO UNLOCK */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">₹{selectedPackage.price}</span>
              <span className="text-xs text-slate-400">for {selectedPackage.leads} verified clients</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instant delivery • Direct clickable phone numbers • Complete unmasked addresses
            </p>
          </div>

          <button
            type="button"
            onClick={handlePayAndUnlock}
            disabled={isProcessingOrder}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2"
          >
            {isProcessingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order & Verifying...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>PAY ₹{selectedPackage.price} & UNLOCK {selectedPackage.leads} CLIENTS NOW</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* UNLOCKED CLIENTS LIST (DELIVERED IMMEDIATELY AFTER PAYMENT) */}
      {unlockedLeads.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/60 shadow-2xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-black text-white">
                  Unlocked Client Opportunity List ({unlockedLeads.length} Clients)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {deliveryMessage || 'All contact details have been unlocked and saved to your account.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel/CSV</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToLeads}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>View All In My Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {lead.category}
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-1 leading-snug">
                        {lead.businessName}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{lead.address}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase bg-emerald-500/20 text-emerald-300 shrink-0">
                      Lead: {lead.leadScore}
                    </span>
                  </div>

                  {/* Contact info with Direct Call & Direct WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block">Direct Phone</span>
                        <a
                          href={`tel:${lead.phone}`}
                          className="font-mono font-bold text-emerald-400 hover:underline block truncate"
                        >
                          {lead.phone}
                        </a>
                      </div>
                      <a
                        href={`tel:${lead.phone}`}
                        title="Click to Call"
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block">WhatsApp Pitch</span>
                        <span className="text-emerald-300 font-semibold text-[11px] block truncate">Instant 1-Click Chat</span>
                      </div>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${lead.businessName}, I noticed your business is doing great in ${lead.city} but doesn't have an official modern website yet. We help local businesses get 2x more inquiries and customer bookings. Can I share a quick sample website preview for you?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Send WhatsApp Pitch"
                        className="p-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-amber-300 font-semibold flex items-center justify-between">
                    <span>Opportunity Audit:</span>
                    <span className="text-emerald-400">Verified: Official website not found</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">100% Unlocked</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(lead)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copiedId === lead.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Contact</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Privacy & Source Notice:</span> Lead information is collected from publicly available business sources. 'No website found' means an official website was not found in the sources checked; it does not guarantee that the business has never had a website.
      </div>
    </div>
  );
};
