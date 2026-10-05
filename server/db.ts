import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  country: string;
  isAdmin: boolean;
  isBanned: boolean;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductConfig {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  currencySymbol: string;
  isActive: boolean;
  countriesAvailable: string[];
}

export interface ClientPackage {
  id: string;
  leads: number;
  price: number;
  currency: string;
  badge?: string;
  title: string;
  savings?: string;
}

export const CLIENT_PACKAGES: ClientPackage[] = [
  { id: 'pack_5', leads: 5, price: 99, currency: 'INR', title: '5 Verified Clients', savings: '₹19.8 / client' },
  { id: 'pack_10', leads: 10, price: 170, currency: 'INR', badge: 'MOST POPULAR', title: '10 Verified Clients', savings: 'Save ₹28 • ₹17 / client' },
  { id: 'pack_20', leads: 20, price: 300, currency: 'INR', badge: 'BEST VALUE', title: '20 Verified Clients', savings: 'Save ₹96 • ₹15 / client' },
];

export interface PaymentRecord {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'PAID' | 'FAILED' | 'REFUNDED';
  creditsAdded: number;
  isVerified: boolean;
  verifiedAt?: string;
  errorReason?: string;
  createdAt: string;
}

export type CreditTransactionType = 'PURCHASE' | 'LEAD_DELIVERY' | 'REFUND' | 'ADMIN_ADJUSTMENT';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number; // e.g. +5 or -5
  balanceAfter: number;
  referenceId?: string; // payment_id, job_id, delivery_batch_id
  notes?: string;
  createdAt: string;
}

export type WebsiteStatus = 'NO_WEBSITE_FOUND' | 'WEBSITE_FOUND' | 'WEBSITE_UNAVAILABLE' | 'WEBSITE_UNKNOWN';
export type LeadScore = 'HIGH' | 'MEDIUM' | 'LOW';

export interface LeadRecord {
  id: string;
  sourcePlaceId: string;
  businessName: string;
  category: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string; // 'Not publicly listed' if not found
  website: string | null;
  websiteStatus: WebsiteStatus;
  websiteCheckedAt: string;
  source: string;
  leadScore: LeadScore;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  httpStatusCode?: number;
  notes?: string;
  createdAt: string;
}

export interface LeadDelivery {
  id: string;
  batchId: string;
  userId: string;
  leadId: string;
  searchJobId: string;
  deliveredAt: string;
}

export type JobState = 'QUEUED' | 'SEARCHING' | 'VERIFYING' | 'FILTERING' | 'READY' | 'FAILED' | 'PARTIAL';

export interface SearchJob {
  id: string;
  userId: string;
  queryText?: string;
  country: string;
  city: string;
  category: string;
  websiteStatusFilter: WebsiteStatus;
  requestedLeads: number;
  status: JobState;
  progressPercentage: number;
  progressMessage: string;
  logs: string[];
  totalCandidatesFound: number;
  qualifiedLeadsFound: number;
  deliveredLeadIds: string[];
  creditsDeducted: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SystemSettings {
  pricing: {
    price: number;
    currency: string;
    currencySymbol: string;
    creditsPerPack: number;
  };
  policy: {
    allowLeadReuseAcrossUsers: boolean;
    strictExact5Rule: boolean;
    minLeadScore: 'HIGH' | 'MEDIUM' | 'LOW';
    maxApiSearchQueries: number;
    requestTimeoutMs: number;
  };
  stats: {
    totalApiRequests: number;
    failedSearches: number;
  };
}

interface DataStore {
  users: Record<string, User>;
  payments: Record<string, PaymentRecord>;
  creditTransactions: CreditTransaction[];
  leads: Record<string, LeadRecord>;
  leadDeliveries: LeadDelivery[];
  searchJobs: Record<string, SearchJob>;
  placesCache: Record<string, { data: any; cachedAt: string }>;
  settings: SystemSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_leadhunter_salt').digest('hex');
}

class Database {
  private store: DataStore;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.store = this.loadData();
    this.seedDefaults();
  }

  private loadData(): DataStore {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load local store, initializing empty store:', e);
    }

    return {
      users: {},
      payments: {},
      creditTransactions: [],
      leads: {},
      leadDeliveries: [],
      searchJobs: {},
      placesCache: {},
      settings: {
        pricing: {
          price: 99,
          currency: 'INR',
          currencySymbol: '₹',
          creditsPerPack: 5,
        },
        policy: {
          allowLeadReuseAcrossUsers: true,
          strictExact5Rule: true,
          minLeadScore: 'MEDIUM',
          maxApiSearchQueries: 4,
          requestTimeoutMs: 15000,
        },
        stats: {
          totalApiRequests: 0,
          failedSearches: 0,
        },
      },
    };
  }

  public save(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        const tempPath = `${DATA_FILE}.tmp.${Date.now()}`;
        fs.writeFileSync(tempPath, JSON.stringify(this.store, null, 2), 'utf-8');
        fs.renameSync(tempPath, DATA_FILE);
      } catch (err) {
        console.error('Error writing database store:', err);
      }
    }, 100);
  }

  private seedDefaults() {
    // Seed default admin if missing
    const adminEmail = 'admin@leadhunter.ai';
    let admin = Object.values(this.store.users).find((u) => u.email === adminEmail);
    if (!admin) {
      const adminId = 'usr_admin_' + crypto.randomBytes(4).toString('hex');
      admin = {
        id: adminId,
        email: adminEmail,
        name: 'Chief Admin',
        passwordHash: hashPassword('admin123'),
        country: 'India',
        isAdmin: true,
        isBanned: false,
        credits: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.store.users[adminId] = admin;
      this.store.creditTransactions.push({
        id: 'tx_seed_' + crypto.randomBytes(4).toString('hex'),
        userId: adminId,
        type: 'ADMIN_ADJUSTMENT',
        amount: 100,
        balanceAfter: 100,
        notes: 'Initial administrator credits',
        createdAt: new Date().toISOString(),
      });
    }

    // Seed default user if missing
    const demoEmail = 'demo@leadhunter.ai';
    let demo = Object.values(this.store.users).find((u) => u.email === demoEmail);
    if (!demo) {
      const demoId = 'usr_demo_' + crypto.randomBytes(4).toString('hex');
      demo = {
        id: demoId,
        email: demoEmail,
        name: 'Demo Agency Lead',
        passwordHash: hashPassword('user123'),
        country: 'India',
        isAdmin: false,
        isBanned: false,
        credits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.store.users[demoId] = demo;
    } else {
      // Ensure zero free credits for demo account
      demo.credits = 0;
    }

    this.save();
  }

  // --- Users ---
  public findUserById(id: string): User | undefined {
    return this.store.users[id];
  }

  public findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return Object.values(this.store.users).find((u) => u.email.toLowerCase() === normalized);
  }

  public createUser(email: string, name: string, passwordPlain: string, country: string = 'India'): User {
    const id = 'usr_' + crypto.randomUUID();
    const newUser: User = {
      id,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash: hashPassword(passwordPlain),
      country: country.trim(),
      isAdmin: false,
      isBanned: false,
      credits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.users[id] = newUser;
    this.save();
    return newUser;
  }

  public verifyPassword(user: User, passwordPlain: string): boolean {
    return user.passwordHash === hashPassword(passwordPlain);
  }

  public getAllUsers(): User[] {
    return Object.values(this.store.users).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public toggleBanUser(userId: string): boolean {
    const user = this.store.users[userId];
    if (!user) return false;
    user.isBanned = !user.isBanned;
    user.updatedAt = new Date().toISOString();
    this.save();
    return user.isBanned;
  }

  // --- Credit Transactions Ledger (Strict Server Authority) ---
  public getUserBalance(userId: string): number {
    const user = this.store.users[userId];
    return user ? Math.max(0, user.credits) : 0;
  }

  public addCredits(
    userId: string,
    amount: number,
    type: CreditTransactionType,
    referenceId?: string,
    notes?: string
  ): { success: boolean; newBalance: number } {
    const user = this.store.users[userId];
    if (!user) return { success: false, newBalance: 0 };
    if (amount <= 0) return { success: false, newBalance: user.credits };

    user.credits = (user.credits || 0) + amount;
    user.updatedAt = new Date().toISOString();

    const tx: CreditTransaction = {
      id: 'ctx_' + crypto.randomUUID(),
      userId,
      type,
      amount,
      balanceAfter: user.credits,
      referenceId,
      notes,
      createdAt: new Date().toISOString(),
    };
    this.store.creditTransactions.push(tx);
    this.save();
    return { success: true, newBalance: user.credits };
  }

  public deductCredits(
    userId: string,
    amount: number,
    type: CreditTransactionType,
    referenceId?: string,
    notes?: string
  ): { success: boolean; newBalance: number; error?: string } {
    const user = this.store.users[userId];
    if (!user) return { success: false, newBalance: 0, error: 'User not found' };
    if (amount <= 0) return { success: false, newBalance: user.credits, error: 'Invalid deduction amount' };
    if (user.credits < amount) {
      return {
        success: false,
        newBalance: user.credits,
        error: `Insufficient credits. Required: ${amount}, Available: ${user.credits}`,
      };
    }

    user.credits -= amount;
    user.updatedAt = new Date().toISOString();

    const tx: CreditTransaction = {
      id: 'ctx_' + crypto.randomUUID(),
      userId,
      type,
      amount: -amount,
      balanceAfter: user.credits,
      referenceId,
      notes,
      createdAt: new Date().toISOString(),
    };
    this.store.creditTransactions.push(tx);
    this.save();
    return { success: true, newBalance: user.credits };
  }

  public getUserTransactions(userId: string): CreditTransaction[] {
    return this.store.creditTransactions
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllTransactions(): CreditTransaction[] {
    return [...this.store.creditTransactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // --- Payments (Razorpay Idempotency & Verification) ---
  public createPaymentRecord(
    userId: string,
    orderId: string,
    amount: number,
    currency: string = 'INR',
    leadsCount: number = 5
  ): PaymentRecord {
    const payment: PaymentRecord = {
      id: 'pay_' + crypto.randomUUID(),
      userId,
      razorpayOrderId: orderId,
      amount,
      currency,
      status: 'CREATED',
      creditsAdded: leadsCount,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    this.store.payments[payment.id] = payment;
    this.save();
    return payment;
  }

  public findPaymentByOrderId(orderId: string): PaymentRecord | undefined {
    return Object.values(this.store.payments).find((p) => p.razorpayOrderId === orderId);
  }

  public findPaymentByPaymentId(paymentId: string): PaymentRecord | undefined {
    return Object.values(this.store.payments).find((p) => p.razorpayPaymentId === paymentId);
  }

  public verifyAndCreditPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    creditsToGrant?: number
  ): { success: boolean; alreadyCredited: boolean; payment?: PaymentRecord; error?: string } {
    let payment = this.findPaymentByOrderId(orderId);
    if (!payment) {
      return { success: false, alreadyCredited: false, error: 'Order not found in records' };
    }

    // Idempotency check: If already paid and verified, prevent duplicate crediting
    if (payment.isVerified && payment.status === 'PAID') {
      return { success: true, alreadyCredited: true, payment };
    }

    const leadsGranted = creditsToGrant || payment.creditsAdded || 5;

    // Verify payment record
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.status = 'PAID';
    payment.isVerified = true;
    payment.verifiedAt = new Date().toISOString();
    payment.creditsAdded = leadsGranted;

    // Add credits to user ledger
    this.addCredits(
      payment.userId,
      leadsGranted,
      'PURCHASE',
      payment.id,
      `Purchased ${leadsGranted} leads package via Razorpay payment ${paymentId}`
    );

    this.save();
    return { success: true, alreadyCredited: false, payment };
  }

  public refundPayment(paymentId: string, reason: string): { success: boolean; error?: string } {
    const payment = this.store.payments[paymentId] || this.findPaymentByPaymentId(paymentId);
    if (!payment) return { success: false, error: 'Payment not found' };
    if (payment.status === 'REFUNDED') return { success: false, error: 'Payment already refunded' };

    payment.status = 'REFUNDED';
    payment.errorReason = reason;

    // Deduct unused credits if available according to policy
    const user = this.store.users[payment.userId];
    if (user && user.credits > 0) {
      const deduction = Math.min(user.credits, payment.creditsAdded);
      if (deduction > 0) {
        this.deductCredits(
          user.id,
          deduction,
          'REFUND',
          payment.id,
          `Credit reversal for refund of payment ${payment.razorpayPaymentId || payment.id}: ${reason}`
        );
      }
    }

    this.save();
    return { success: true };
  }

  public getAllPayments(): PaymentRecord[] {
    return Object.values(this.store.payments).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getUserPayments(userId: string): PaymentRecord[] {
    return Object.values(this.store.payments)
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Leads Records & Deliveries ---
  public upsertLead(leadData: Omit<LeadRecord, 'id' | 'createdAt'>): LeadRecord {
    const existing = Object.values(this.store.leads).find(
      (l) => l.sourcePlaceId === leadData.sourcePlaceId
    );
    if (existing) {
      Object.assign(existing, leadData);
      this.save();
      return existing;
    }

    const id = 'lead_' + crypto.randomUUID();
    const newLead: LeadRecord = {
      ...leadData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.store.leads[id] = newLead;
    this.save();
    return newLead;
  }

  public getLeadById(id: string): LeadRecord | undefined {
    return this.store.leads[id];
  }

  public hasUserReceivedLead(userId: string, leadId: string): boolean {
    return this.store.leadDeliveries.some((d) => d.userId === userId && d.leadId === leadId);
  }

  public recordLeadDelivery(
    batchId: string,
    userId: string,
    leadId: string,
    searchJobId: string
  ): LeadDelivery {
    const delivery: LeadDelivery = {
      id: 'del_' + crypto.randomUUID(),
      batchId,
      userId,
      leadId,
      searchJobId,
      deliveredAt: new Date().toISOString(),
    };
    this.store.leadDeliveries.push(delivery);
    this.save();
    return delivery;
  }

  public getUserDeliveredLeads(userId: string): { lead: LeadRecord; deliveredAt: string; batchId: string }[] {
    const deliveries = this.store.leadDeliveries.filter((d) => d.userId === userId);
    return deliveries
      .map((d) => {
        const lead = this.store.leads[d.leadId];
        return lead ? { lead, deliveredAt: d.deliveredAt, batchId: d.batchId } : null;
      })
      .filter((item): item is { lead: LeadRecord; deliveredAt: string; batchId: string } => item !== null)
      .sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime());
  }

  public getAllDeliveries(): (LeadDelivery & { businessName?: string; userEmail?: string })[] {
    return this.store.leadDeliveries
      .map((d) => {
        const lead = this.store.leads[d.leadId];
        const user = this.store.users[d.userId];
        return {
          ...d,
          businessName: lead?.businessName,
          userEmail: user?.email,
        };
      })
      .sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime());
  }

  // --- Search Jobs ---
  public createSearchJob(
    userId: string,
    data: {
      queryText?: string;
      country: string;
      city: string;
      category: string;
      websiteStatusFilter?: WebsiteStatus;
      requestedLeads?: number;
    }
  ): SearchJob {
    const id = 'job_' + crypto.randomUUID();
    const job: SearchJob = {
      id,
      userId,
      queryText: data.queryText,
      country: data.country,
      city: data.city,
      category: data.category,
      websiteStatusFilter: data.websiteStatusFilter || 'NO_WEBSITE_FOUND',
      requestedLeads: data.requestedLeads || 5,
      status: 'QUEUED',
      progressPercentage: 5,
      progressMessage: 'Initializing search job...',
      logs: [`[${new Date().toISOString()}] Search queued for ${data.category} in ${data.city}, ${data.country}`],
      totalCandidatesFound: 0,
      qualifiedLeadsFound: 0,
      deliveredLeadIds: [],
      creditsDeducted: 0,
      createdAt: new Date().toISOString(),
    };
    this.store.searchJobs[id] = job;
    this.save();
    return job;
  }

  public getSearchJob(id: string): SearchJob | undefined {
    return this.store.searchJobs[id];
  }

  public updateSearchJob(
    id: string,
    updates: Partial<SearchJob> & { log?: string }
  ): SearchJob | undefined {
    const job = this.store.searchJobs[id];
    if (!job) return undefined;

    if (updates.log) {
      job.logs = job.logs || [];
      job.logs.push(`[${new Date().toISOString()}] ${updates.log}`);
    }

    const { log, ...directUpdates } = updates;
    Object.assign(job, directUpdates);

    this.save();
    return job;
  }

  public getUserSearchJobs(userId: string): SearchJob[] {
    return Object.values(this.store.searchJobs)
      .filter((j) => j.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllSearchJobs(): SearchJob[] {
    return Object.values(this.store.searchJobs).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // --- Places Cache ---
  public getCachedPlace(placeId: string): any | null {
    const cached = this.store.placesCache[placeId];
    if (!cached) return null;
    // 7 days TTL
    const now = Date.now();
    const cacheTime = new Date(cached.cachedAt).getTime();
    if (now - cacheTime > 7 * 24 * 60 * 60 * 1000) {
      delete this.store.placesCache[placeId];
      return null;
    }
    return cached.data;
  }

  public setCachedPlace(placeId: string, data: any): void {
    this.store.placesCache[placeId] = {
      data,
      cachedAt: new Date().toISOString(),
    };
    this.save();
  }

  // --- Settings & Metrics ---
  public getSettings(): SystemSettings {
    return this.store.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    if (updates.pricing) {
      this.store.settings.pricing = { ...this.store.settings.pricing, ...updates.pricing };
    }
    if (updates.policy) {
      this.store.settings.policy = { ...this.store.settings.policy, ...updates.policy };
    }
    this.save();
    return this.store.settings;
  }

  public recordApiRequest(failed: boolean = false) {
    this.store.settings.stats.totalApiRequests = (this.store.settings.stats.totalApiRequests || 0) + 1;
    if (failed) {
      this.store.settings.stats.failedSearches = (this.store.settings.stats.failedSearches || 0) + 1;
    }
    this.save();
  }
}

export const db = new Database();
