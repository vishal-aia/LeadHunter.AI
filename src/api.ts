import { User, UserMetrics, SystemStatus, SearchJob, DeliveredLeadItem, PaymentRecord, CreditTransaction, ProofPreviewResponse } from './types';

const TOKEN_KEY = 'leadhunter_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data as T;
  },

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  },

  async register(email: string, name: string, password: string, country: string) {
    const data = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password, country }),
    });
    this.setToken(data.token);
    return data;
  },

  async switchAccount(role: 'admin' | 'user' = 'user') {
    const data = await this.request<{ token: string; user: User }>('/api/auth/switch-account', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setToken(data.token);
    return data;
  },

  async getMe() {
    return this.request<{ user: User; metrics: UserMetrics }>('/api/auth/me');
  },

  // System
  async getSystemStatus() {
    return this.request<SystemStatus>('/api/system/status');
  },

  // Payments
  async createPaymentOrder(packageId?: string, leadCount?: number) {
    return this.request<{
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      isTestMode: boolean;
      product: {
        id: string;
        name: string;
        credits: number;
        price: number;
        currency: string;
        currencySymbol: string;
      };
    }>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ packageId, leadCount }),
    });
  },

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    return this.request<{
      success: boolean;
      message: string;
      creditsAdded: number;
      availableCredits: number;
    }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    });
  },

  async getPaymentHistory() {
    return this.request<{
      payments: PaymentRecord[];
      transactions: CreditTransaction[];
      currentBalance: number;
    }>('/api/payments/history');
  },

  // Proof & Discovery
  async getProofPreview(country: string, city: string, category: string) {
    return this.request<ProofPreviewResponse>('/api/leads/proof-preview', {
      method: 'POST',
      body: JSON.stringify({ country, city, category }),
    });
  },

  // Search & Leads
  async aiParseCommand(prompt: string) {
    return this.request<{
      country?: string;
      city?: string;
      category?: string;
      website_status?: string;
      requested_leads?: number;
      is_valid: boolean;
      clarification_needed?: string;
      original_query: string;
    }>('/api/search/ai-parse', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },

  async startSearchJob(params: {
    country: string;
    city: string;
    category: string;
    requestedLeads?: number;
    queryText?: string;
    websiteStatusFilter?: string;
  }) {
    return this.request<{
      jobId: string;
      status: string;
      progressPercentage: number;
      progressMessage: string;
    }>('/api/search/jobs', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async pollSearchJob(jobId: string) {
    return this.request<{
      job: SearchJob;
      leads: any[];
    }>(`/api/search/jobs/${jobId}`);
  },

  async claimSearchBatch(jobId: string) {
    return this.request<{
      success: boolean;
      message: string;
      creditsDeducted: number;
      remainingCredits: number;
      leads: any[];
    }>(`/api/search/jobs/${jobId}/claim`, {
      method: 'POST',
    });
  },

  async getMyLeads() {
    return this.request<{
      total: number;
      leads: DeliveredLeadItem[];
      disclaimer: string;
    }>('/api/leads/my-leads');
  },
};
