export interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  credits: number;
  isAdmin: boolean;
  isBanned?: boolean;
  createdAt: string;
}

export interface UserMetrics {
  availableCredits: number;
  leadsPurchased: number;
  leadsDelivered: number;
  totalPaymentsCount: number;
  totalSpent: number;
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
  email: string;
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

export interface DeliveredLeadItem {
  lead: LeadRecord;
  deliveredAt: string;
  batchId: string;
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

export interface PaymentRecord {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'PAID' | 'FAILED' | 'REFUNDED';
  creditsAdded: number;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'PURCHASE' | 'LEAD_DELIVERY' | 'REFUND' | 'ADMIN_ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
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

export interface ProofSample {
  id: string;
  businessName: string;
  address: string;
  maskedPhone: string;
  websiteStatus: WebsiteStatus;
  leadScore: LeadScore;
  verificationBadge: string;
  highIntentReason: string;
}

export interface ProofPreviewResponse {
  totalAvailable: number;
  samples: ProofSample[];
}

export interface SystemStatus {
  appName: string;
  tagline: string;
  razorpayKeyId: string;
  packages: ClientPackage[];
}
