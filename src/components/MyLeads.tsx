import React, { useState, useEffect } from 'react';
import { DeliveredLeadItem, LeadRecord } from '../types';
import { api } from '../api';
import {
  FolderHeart,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Download,
  Copy,
  Check,
  Search,
  Building2,
  Calendar,
  ShieldCheck,
  RefreshCw,
  Coins,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface MyLeadsProps {
  onNavigateToSearch: () => void;
  onOpenBuyModal: () => void;
}

export const MyLeads: React.FC<MyLeadsProps> = ({ onNavigateToSearch, onOpenBuyModal }) => {
  const [deliveredLeads, setDeliveredLeads] = useState<DeliveredLeadItem[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [selectedScore, setSelectedScore] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyLeads();
      setDeliveredLeads(data.leads || []);
      setDisclaimer(data.disclaimer);
    } catch (err) {
      console.error('Failed to load delivered leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const copyToClipboard = (lead: LeadRecord) => {
    const text = `Business: ${lead.businessName}
Category: ${lead.category}
Location: ${lead.address}
Phone: ${lead.phone}
Email: ${lead.email}
Website Status: ${lead.websiteStatus === 'NO_WEBSITE_FOUND' ? 'Official website not found' : lead.websiteStatus}
Lead Score: ${lead.leadScore}`;

    navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    if (deliveredLeads.length === 0) return;

    const headers = [
      'Business Name',
      'Category',
      'Country',
      'City',
      'Address',
      'Public Phone',
      'Public Email',
      'Website',
      'Website Status',
      'Lead Score',
      'Delivered At',
    ];

    const rows = deliveredLeads.map(({ lead, deliveredAt }) => [
      `"${lead.businessName.replace(/"/g, '""')}"`,
      `"${lead.category.replace(/"/g, '""')}"`,
      `"${lead.country.replace(/"/g, '""')}"`,
      `"${lead.city.replace(/"/g, '""')}"`,
      `"${lead.address.replace(/"/g, '""')}"`,
      `"${lead.phone.replace(/"/g, '""')}"`,
      `"${lead.email.replace(/"/g, '""')}"`,
      `"${(lead.website || '').replace(/"/g, '""')}"`,
      `"${lead.websiteStatus}"`,
      `"${lead.leadScore}"`,
      `"${deliveredAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LeadHunter_My_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (deliveredLeads.length === 0) return;
    const blob = new Blob([JSON.stringify(deliveredLeads, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LeadHunter_My_Leads_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = deliveredLeads.filter(({ lead }) => {
    const searchMatch =
      lead.businessName.toLowerCase().includes(filterText.toLowerCase()) ||
      lead.city.toLowerCase().includes(filterText.toLowerCase()) ||
      lead.category.toLowerCase().includes(filterText.toLowerCase()) ||
      lead.address.toLowerCase().includes(filterText.toLowerCase());

    const scoreMatch = selectedScore === 'ALL' || lead.leadScore === selectedScore;
    return searchMatch && scoreMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <span>My Delivered Leads</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {deliveredLeads.length} Total
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Access your unlocked website opportunity leads. These leads are permanently bound to your account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh Leads"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {deliveredLeads.length > 0 && (
            <>
              <button
                onClick={exportCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={exportJSON}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export JSON</span>
              </button>
            </>
          )}

          <button
            onClick={onNavigateToSearch}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find New Leads</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {deliveredLeads.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by business name, city, category, or address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">Score:</span>
            {['ALL', 'HIGH', 'MEDIUM'].map((score) => (
              <button
                key={score}
                onClick={() => setSelectedScore(score)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedScore === score
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leads Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading your delivered lead records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 px-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
            <FolderHeart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No delivered leads found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {deliveredLeads.length === 0
                ? "You haven't unlocked any lead batches yet. Run a search to discover businesses that need websites."
                : 'No leads match your current search and score filters.'}
            </p>
          </div>

          {deliveredLeads.length === 0 && (
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onNavigateToSearch}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
              >
                Find 5 Leads
              </button>
              <button
                onClick={onOpenBuyModal}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buy Credits</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(({ lead, deliveredAt }) => (
            <div
              key={lead.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {lead.category}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(deliveredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white leading-snug">{lead.businessName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{lead.address}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                        lead.leadScore === 'HIGH'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      Lead: {lead.leadScore}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{lead.verificationStatus}</span>
                    </span>
                  </div>
                </div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                  {/* Phone */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block">Phone</span>
                        {lead.phone && lead.phone !== 'Not publicly listed' ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="font-mono font-semibold text-emerald-300 hover:underline block truncate"
                          >
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">Not publicly listed</span>
                        )}
                      </div>
                    </div>

                    {lead.phone && lead.phone !== 'Not publicly listed' && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <a
                          href={`tel:${lead.phone}`}
                          title="Call Client"
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hi ${lead.businessName}, I noticed your business doesn't have an official website yet. We build modern high-converting websites for businesses in ${lead.city}. Would you be open to seeing a sample?`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp Pitch"
                          className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block">Public Email</span>
                        <span className="text-slate-400 block truncate">{lead.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Website Intelligence Banner */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Website Opportunity Status
                    </span>
                    <span className="font-bold text-amber-300">
                      {lead.websiteStatus === 'NO_WEBSITE_FOUND'
                        ? 'Official website not found in available business sources'
                        : lead.websiteStatus === 'WEBSITE_UNAVAILABLE'
                        ? 'Website configured in source failed HTTP availability check'
                        : lead.websiteStatus}
                    </span>
                  </div>

                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Inspect recorded URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  Source: {lead.source}
                </span>

                <button
                  onClick={() => copyToClipboard(lead)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                >
                  {copiedId === lead.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Lead Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mandatory Disclaimer (Section 19) */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Privacy & Source Notice:</span> {disclaimer || "Lead information is collected from publicly available business sources. 'No website found' means an official website was not found in the sources checked; it does not guarantee that the business has never had a website."}
      </div>
    </div>
  );
};
