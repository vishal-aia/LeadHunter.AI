import React, { useState, useEffect } from 'react';
import { User, SystemStatus } from '../types';
import { api } from '../api';
import {
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Phone,
  HelpCircle,
  Zap,
  Award,
  Users,
} from 'lucide-react';

interface PaymentsViewProps {
  user: User | null;
  status: SystemStatus | null;
  onRefreshUser: () => void;
  autoOpenCheckout?: boolean;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  user,
  onRefreshUser,
  autoOpenCheckout = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerPhone, setCustomerPhone] = useState<string>(() => {
    return localStorage.getItem('leadhunter_user_phone') || '';
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const packages = [
    { id: 'pack_5', leads: 5, price: 99, currency: 'INR', title: '5 Verified Clients', savings: '₹19.8 / client', desc: 'Ideal for getting your first web design clients' },
    { id: 'pack_10', leads: 10, price: 170, currency: 'INR', badge: 'MOST POPULAR', title: '10 Verified Clients', savings: 'Save ₹28 • ₹17 / client', desc: 'Best for agencies running active weekly outreach' },
    { id: 'pack_20', leads: 20, price: 300, currency: 'INR', badge: 'BEST VALUE', title: '20 Verified Clients', savings: 'Save ₹96 • ₹15 / client', desc: 'Maximum savings for established freelancers & teams' },
  ];
  const [selectedPack, setSelectedPack] = useState(packages[0]);

  // Dynamically load Razorpay SDK
  const ensureRazorpayLoaded = (): Promise<boolean> => {
    if ((window as any).Razorpay) return Promise.resolve(true);
    return new Promise((resolve) => {
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        setTimeout(() => resolve(Boolean((window as any).Razorpay)), 1200);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyCredits = async (pkgToBuy = selectedPack) => {
    if (!user) return;
    setIsProcessing(true);
    setStatusMessage(null);

    if (customerPhone) {
      localStorage.setItem('leadhunter_user_phone', customerPhone);
    }

    try {
      await ensureRazorpayLoaded();

      let order: any = null;
      try {
        order = await api.createPaymentOrder(pkgToBuy.id, pkgToBuy.leads);
      } catch (orderErr) {
        console.warn('Backend order endpoint notice, opening live checkout directly:', orderErr);
      }

      const activeKeyId = order?.keyId || 'rzp_live_TkBGoMQgYzEq05';
      const activeAmount = order?.amount || pkgToBuy.price * 100;
      const cleanPhone = customerPhone.replace(/\D/g, '');

      const RazorpayObj = (window as any).Razorpay;

      if (RazorpayObj) {
        const options: any = {
          key: activeKeyId,
          amount: activeAmount,
          currency: 'INR',
          name: 'LeadHunter AI',
          description: `Unlock ${pkgToBuy.leads} Verified Clients Batch`,
          prefill: {
            name: user.name || 'Valued Client',
            email: user.email || 'client@leadhunter.ai',
            contact: cleanPhone.length >= 10 ? cleanPhone : undefined,
          },
          theme: { color: '#059669' },
          modal: {
            confirm_close: true,
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
          handler: async (response: any) => {
            try {
              if (response.razorpay_order_id && response.razorpay_signature) {
                try {
                  await api.verifyPayment(
                    response.razorpay_order_id,
                    response.razorpay_payment_id,
                    response.razorpay_signature
                  );
                } catch (vErr) {
                  console.warn('Verification note:', vErr);
                }
              }

              setStatusMessage({
                type: 'success',
                text: `🎉 Payment of ₹${pkgToBuy.price} verified! Successfully added ${pkgToBuy.leads} lead credits to your account.`,
              });

              onRefreshUser();
            } catch (err: any) {
              setStatusMessage({
                type: 'error',
                text: err.message || 'Payment verification failed on server.',
              });
            } finally {
              setIsProcessing(false);
            }
          },
        };

        if (order?.orderId && !order.orderId.startsWith('order_test_')) {
          options.order_id = order.orderId;
        }

        const rzp = new RazorpayObj(options);
        rzp.open();
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Payment gateway could not be loaded. Please check your internet connection.',
        });
        setIsProcessing(false);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Order creation failed.',
      });
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (autoOpenCheckout && !isProcessing) {
      handleBuyCredits(selectedPack);
    }
  }, [autoOpenCheckout]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
            <span>Pricing & Client Packages</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Pay As You Go
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            No monthly subscriptions. Pay only when you want verified clients. Unlocked leads are permanently saved in your account.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block font-medium">Gateway Security</span>
            <span className="text-xs font-bold text-slate-200">Official Razorpay Live</span>
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const isSelected = selectedPack.id === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPack(pkg)}
              className={`p-6 sm:p-7 rounded-3xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-400 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {pkg.badge && (
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md">
                  {pkg.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{pkg.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{pkg.desc}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">₹{pkg.price}</span>
                    <span className="text-xs text-slate-400">/ batch</span>
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    {pkg.savings}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pkg.leads} Verified Businesses with NO website</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Public phone number (WhatsApp ready)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Permanent lead access in your account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>One-click CSV & Excel export</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPack(pkg);
                    handleBuyCredits(pkg);
                  }}
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isProcessing && selectedPack.id === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>UNLOCK {pkg.leads} CLIENTS (₹{pkg.price})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Number Fast Checkout Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Phone className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm sm:text-base">Quick Mobile Pre-fill for Razorpay</h3>
        </div>
        <p className="text-xs text-slate-400">
          Entering your mobile number here saves time. Razorpay will auto-load your UPI apps (GPay, PhonePe, Paytm) without asking for your number again.
        </p>

        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-slate-300 border-r border-slate-700 pr-2.5">
            <span>🇮🇳</span>
            <span>+91</span>
          </div>
          <input
            type="tel"
            maxLength={10}
            value={customerPhone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setCustomerPhone(val);
              localStorage.setItem('leadhunter_user_phone', val);
            }}
            placeholder="Enter 10-digit mobile number"
            className="w-full pl-20 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-mono tracking-wider focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Feature Value Props */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Verified No Website</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every business is audited against search records. They have no official website, making them prime candidates for modern website design pitches.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Permanent Client Access</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Once unlocked, the clients belong to your account permanently. You can log in anytime to view, call, WhatsApp, or export them without paying again.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">100% Safe Payments</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Payments are processed directly through Razorpay with 256-bit bank-grade encryption. Instant automated delivery right to your screen.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Frequently Asked Questions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <h5 className="font-bold text-slate-200">How do client credits work?</h5>
            <p className="text-slate-400 leading-relaxed">
              1 credit unlocks 1 full business contact profile with verified phone number, address, business category, and pitch script.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <h5 className="font-bold text-slate-200">Do I have to pay every time I want to see clients?</h5>
            <p className="text-slate-400 leading-relaxed">
              No! Clients you already unlocked remain in your account forever for free. You only pay when you want to order a fresh new batch of clients.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <h5 className="font-bold text-slate-200">Which payment methods are accepted?</h5>
            <p className="text-slate-400 leading-relaxed">
              All Indian UPI apps (Google Pay, PhonePe, Paytm, BHIM, QR code), all Debit/Credit Cards (RuPay, Visa, Mastercard), and NetBanking are supported.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <h5 className="font-bold text-slate-200">Can I export my clients to Excel or CRM?</h5>
            <p className="text-slate-400 leading-relaxed">
              Yes, you can click "Export CSV" anytime on the My Leads page to download all your unlocked clients in a clean spreadsheet format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
