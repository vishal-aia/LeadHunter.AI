import React, { useState, useEffect } from 'react';
import { User, PaymentRecord, CreditTransaction, SystemStatus } from '../types';
import { api } from '../api';
import {
  CreditCard,
  Sparkles,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface PaymentsViewProps {
  user: User | null;
  status: SystemStatus | null;
  onRefreshUser: () => void;
  autoOpenCheckout?: boolean;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  user,
  status,
  onRefreshUser,
  autoOpenCheckout = false,
}) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const packages = [
    { id: 'pack_5', leads: 5, price: 99, currency: 'INR', title: '5 Verified Clients', savings: '₹19.8 / client' },
    { id: 'pack_10', leads: 10, price: 170, currency: 'INR', badge: 'MOST POPULAR', title: '10 Verified Clients', savings: 'Save ₹28 • ₹17 / client' },
    { id: 'pack_20', leads: 20, price: 300, currency: 'INR', badge: 'BEST VALUE', title: '20 Verified Clients', savings: 'Save ₹96 • ₹15 / client' },
  ];
  const [selectedPack, setSelectedPack] = useState(packages[0]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPaymentHistory();
      setPayments(data.payments || []);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to load payments history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle auto-open if prompted from Buy modal
  useEffect(() => {
    if (autoOpenCheckout && !isProcessing) {
      handleBuyCredits(selectedPack);
    }
  }, [autoOpenCheckout]);

  const handleBuyCredits = async (pkgToBuy = selectedPack) => {
    if (!user) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      // 1. Backend creates Razorpay order for selected package
      const order = await api.createPaymentOrder(pkgToBuy.id, pkgToBuy.leads);

      // Check if Razorpay JS SDK is loaded on window
      const RazorpayObj = (window as any).Razorpay;

      if (RazorpayObj && !order.isTestMode) {
        // Live Razorpay Checkout Modal
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'LeadHunter AI',
          description: `Unlock ${pkgToBuy.leads} Verified Lead Credits`,
          order_id: order.orderId,
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#10b981',
          },
          handler: async (response: any) => {
            try {
              // 2. Server-side cryptographic signature verification
              const verifyRes = await api.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              setStatusMessage({
                type: 'success',
                text: verifyRes.message,
              });

              onRefreshUser();
              fetchHistory();
            } catch (err: any) {
              setStatusMessage({
                type: 'error',
                text: err.message || 'Payment verification failed on server.',
              });
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new RazorpayObj(options);
        rzp.open();
      } else {
        // Test / Sandbox simulation
        const testPaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 12);
        const testSignature = `test_sig_${order.orderId}_${testPaymentId}`;

        // Verify with backend
        const verifyRes = await api.verifyPayment(order.orderId, testPaymentId, testSignature);

        setStatusMessage({
          type: 'success',
          text: `[Payment Verified] ${verifyRes.message}`,
        });

        onRefreshUser();
        fetchHistory();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <span>Payments & Credit Ledger</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Server-Verified
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Purchase lead credits with server-verified Razorpay security. Every credit transaction is cryptographically logged.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Balance</span>
              <span className="text-sm font-extrabold text-white">{user?.credits || 0} Credits</span>
            </div>
          </div>

          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>

          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Credit Purchase Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Official Marketplace Packs
              </span>
              <span className="text-slate-400 text-xs">One-time payment • Never expires • Verified Candidates</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Choose Lead Pack: 5, 10, or 20 Verified Clients
            </h2>

            <p className="text-slate-300 text-sm max-w-xl">
              Unlocks qualified business leads whose official website was not found in public business registries. Delivers verified public phone numbers, normalized locations, and qualification scoring.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center shrink-0 min-w-[220px] space-y-3">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Selected Pack Price</span>
              <div className="text-4xl font-black text-emerald-400 mt-0.5">
                ₹{selectedPack.price}
              </div>
              <span className="text-[11px] text-slate-400">for {selectedPack.leads} lead credits ({selectedPack.currency})</span>
            </div>

            <button
              onClick={() => handleBuyCredits(selectedPack)}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>PAY ₹{selectedPack.price} NOW</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3 Package Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {packages.map((pkg) => {
            const isSelected = selectedPack.id === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPack(pkg)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {pkg.badge && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                    {pkg.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{pkg.title}</span>
                  <span className="font-extrabold text-base text-emerald-400">₹{pkg.price}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{pkg.savings}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit Transactions Ledger (Section 14) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Credit Transaction Ledger</h3>
          </div>
          <span className="text-xs text-slate-400">Immutable server-authoritative ledger</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No credit transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Balance After</th>
                  <th className="py-3 px-4">Notes & Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          tx.type === 'PURCHASE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : tx.type === 'LEAD_DELIVERY'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : tx.type === 'REFUND'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-black text-sm ${
                          tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      {tx.balanceAfter}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {tx.notes || tx.referenceId || 'System credit transaction'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verified Razorpay Payment Records (Section 13) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Verified Razorpay Payment Orders</h3>
          </div>
          <span className="text-xs text-slate-400">Server verified status</span>
        </div>

        {payments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No payment records found. Click "Buy 5 Leads Now" above to initiate an order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Credits Added</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px] truncate max-w-[150px]">
                      {p.razorpayOrderId}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] truncate max-w-[150px]">
                      {p.razorpayPaymentId || 'Pending Checkout'}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{p.amount} {p.currency}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-400">
                      +{p.creditsAdded}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'PAID' && p.isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.status === 'REFUNDED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.isVerified ? 'VERIFIED PAID' : p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
