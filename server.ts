import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { db, User, CLIENT_PACKAGES } from './server/db.js';
import { createOrder, verifySignature, verifyWebhookSignature, getRazorpayCredentials } from './server/razorpay.js';
import { parseNaturalLanguageCommand } from './server/gemini.js';
import { executeSearchJob, getProofPreview } from './server/places.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Capture raw body for webhook HMAC signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Simple Auth Session Middleware using Authorization Bearer / Session Token
function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const user = db.findUserById(token) || db.findUserByEmail(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Invalid session' });
    return;
  }

  if (user.isBanned) {
    res.status(403).json({ error: 'Account has been suspended.' });
    return;
  }

  (req as any).user = user;
  next();
}

// ----------------------------------------------------
// 1. SYSTEM & CONFIG STATUS APIS (Airtight - Zero Leakage)
// ----------------------------------------------------
app.get('/api/system/status', (_req: Request, res: Response) => {
  const razorpay = getRazorpayCredentials();

  res.json({
    appName: 'LeadHunter AI',
    tagline: 'Find businesses that need a website.',
    razorpayKeyId: razorpay.keyId,
    packages: CLIENT_PACKAGES,
  });
});

// ----------------------------------------------------
// PROOF PREVIEW API (Live Proof Before Payment)
// ----------------------------------------------------
app.post('/api/leads/proof-preview', (req: Request, res: Response) => {
  const { country, city, category } = req.body;
  const result = getProofPreview(category || 'Doctor', city || 'Mumbai', country || 'India');
  res.json(result);
});

// ----------------------------------------------------
// 2. AUTHENTICATION APIS
// ----------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, name, password, country } = req.body;
  if (!email || !name || !password) {
    res.status(400).json({ error: 'Email, name, and password are required' });
    return;
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const user = db.createUser(email, name, password, country || 'India');
  res.json({
    token: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      credits: user.credits,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.findUserByEmail(email);
  if (!user || !db.verifyPassword(user, password)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (user.isBanned) {
    res.status(403).json({ error: 'This account has been banned. Contact support.' });
    return;
  }

  res.json({
    token: user.id,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      credits: user.credits,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    },
  });
});

app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  // Re-fetch latest from DB
  const fresh = db.findUserById(user.id);
  if (!fresh) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const balance = db.getUserBalance(fresh.id);
  const delivered = db.getUserDeliveredLeads(fresh.id).length;
  const payments = db.getUserPayments(fresh.id).filter((p) => p.isVerified);
  const totalPurchased = payments.reduce((acc, p) => acc + p.creditsAdded, 0);

  res.json({
    user: {
      id: fresh.id,
      email: fresh.email,
      name: fresh.name,
      country: fresh.country,
      credits: balance,
      isAdmin: fresh.isAdmin,
      isBanned: fresh.isBanned,
      createdAt: fresh.createdAt,
    },
    metrics: {
      availableCredits: balance,
      leadsPurchased: totalPurchased,
      leadsDelivered: delivered,
      totalPaymentsCount: payments.length,
      totalSpent: payments.reduce((acc, p) => acc + p.amount, 0),
    },
  });
});

// Quick account reload helper for testing demo user
app.post('/api/auth/switch-account', (_req: Request, res: Response) => {
  const targetEmail = 'demo@leadhunter.ai';
  const target = db.findUserByEmail(targetEmail);
  if (!target) {
    res.status(404).json({ error: 'Demo account not found' });
    return;
  }

  res.json({
    token: target.id,
    user: {
      id: target.id,
      email: target.email,
      name: target.name,
      country: target.country,
      credits: db.getUserBalance(target.id),
      isAdmin: false,
      createdAt: target.createdAt,
    },
  });
});

// ----------------------------------------------------
// 3. PAYMENT & CREDIT SYSTEM (RAZORPAY + LEDGER)
// ----------------------------------------------------
app.post('/api/payments/create-order', authMiddleware, async (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { packageId, leadCount } = req.body;
  const pkg =
    CLIENT_PACKAGES.find((p) => p.id === packageId || p.leads === Number(leadCount)) || CLIENT_PACKAGES[0];
  const price = pkg.price;
  const currency = pkg.currency;
  const leadsToGrant = pkg.leads;

  try {
    const order = await createOrder(price, currency, {
      userId: user.id,
      userEmail: user.email,
      packageId: pkg.id,
      leadsCount: String(leadsToGrant),
    });

    // Record pending payment in database
    db.createPaymentRecord(user.id, order.id, price, currency, leadsToGrant);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      isTestMode: order.isTestMode,
      product: {
        id: pkg.id,
        name: pkg.title,
        credits: leadsToGrant,
        price,
        currency,
        currencySymbol: '₹',
      },
    });
  } catch (err: any) {
    console.error('Error creating payment order:', err);
    res.status(500).json({ error: 'Failed to create payment order. Please try again.' });
  }
});

// Server-side Payment Verification
app.post('/api/payments/verify', authMiddleware, async (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({
      error: 'Missing verification parameters. order_id, payment_id, and signature are required.',
    });
    return;
  }

  // 1. Cryptographic HMAC SHA256 Signature Verification
  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    console.error('Security alert: Razorpay signature verification failed for order', razorpay_order_id);
    res.status(400).json({
      error: 'Payment could not be verified. Please contact support if your bank/payment provider shows a debit.',
    });
    return;
  }

  // 2. Atomic Database Update & Idempotent Credit Grant
  const creditResult = db.verifyAndCreditPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!creditResult.success) {
    res.status(400).json({ error: creditResult.error || 'Failed to process payment record' });
    return;
  }

  const newBalance = db.getUserBalance(user.id);
  const creditsAdded = creditResult.payment?.creditsAdded || 5;

  res.json({
    success: true,
    message: creditResult.alreadyCredited
      ? 'Payment was already verified. Account balance confirmed.'
      : `Payment verified successfully! Exactly ${creditsAdded} lead credits added to your account.`,
    creditsAdded: creditResult.alreadyCredited ? 0 : creditsAdded,
    availableCredits: newBalance,
    paymentId: razorpay_payment_id,
  });
});

// Razorpay Webhook Handler (Dual Verification & Reliability)
app.post('/api/payments/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  if (signature) {
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('Webhook signature check failed.');
      res.status(400).send('Invalid signature');
      return;
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || payload?.order?.entity?.id;
    const paymentId = paymentEntity?.id;

    if (orderId && paymentId) {
      const settings = db.getSettings();
      // Server idempotency handles multiple webhook calls safely
      db.verifyAndCreditPayment(
        orderId,
        paymentId,
        signature || 'webhook_verified',
        settings.pricing.creditsPerPack || 5
      );
    }
  }

  res.status(200).json({ received: true });
});

// Payment & Credit Ledger History
app.get('/api/payments/history', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const payments = db.getUserPayments(user.id);
  const transactions = db.getUserTransactions(user.id);
  const currentBalance = db.getUserBalance(user.id);

  res.json({
    payments,
    transactions,
    currentBalance,
  });
});

// ----------------------------------------------------
// 4. NATURAL LANGUAGE AI COMMAND (GEMINI)
// ----------------------------------------------------
app.post('/api/search/ai-parse', authMiddleware, async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'A natural language search query is required.' });
    return;
  }

  const parsed = await parseNaturalLanguageCommand(prompt);
  res.json(parsed);
});

// ----------------------------------------------------
// 5. SEARCH JOB & LEAD DISCOVERY SYSTEM
// ----------------------------------------------------
app.post('/api/search/jobs', authMiddleware, async (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { country, city, category, queryText, websiteStatusFilter } = req.body;

  if (!country || !city || !category) {
    res.status(400).json({ error: 'Country, city, and business category are required.' });
    return;
  }

  const balance = db.getUserBalance(user.id);
  const requestedLeads = Number(req.body.requestedLeads) || 5;

  // Credit Gate: Check if user has sufficient credits before creating search job
  if (balance < requestedLeads) {
    res.status(402).json({
      error: `Insufficient lead credits. You need ${requestedLeads} credits to unlock this verified lead batch (Current balance: ${balance}). Please purchase a client package first.`,
      availableCredits: balance,
      requiredCredits: requestedLeads,
    });
    return;
  }

  // Create asynchronous job
  const job = db.createSearchJob(user.id, {
    queryText,
    country: country.trim(),
    city: city.trim(),
    category: category.trim(),
    websiteStatusFilter: websiteStatusFilter || 'NO_WEBSITE_FOUND',
    requestedLeads,
  });

  // Execute job asynchronously in background
  executeSearchJob({
    jobId: job.id,
    userId: user.id,
    category: job.category,
    city: job.city,
    country: job.country,
    websiteStatusFilter: job.websiteStatusFilter,
    requestedCount: requestedLeads,
  })
    .then((result) => {
      if (result.success && result.qualifiedLeads.length >= requestedLeads) {
        db.updateSearchJob(job.id, {
          status: 'READY',
          progressPercentage: 100,
          progressMessage: `Found ${result.qualifiedLeads.length} verified website opportunity leads ready to unlock.`,
          qualifiedLeadsFound: result.qualifiedLeads.length,
          deliveredLeadIds: result.qualifiedLeads.map((l) => l.id),
          completedAt: new Date().toISOString(),
          log: `Search job completed successfully. Ready for user delivery.`,
        });
      } else {
        // Less than 5 leads found: Default strict policy - DO NOT consume credits!
        db.updateSearchJob(job.id, {
          status: 'PARTIAL',
          progressPercentage: 100,
          progressMessage: `Only ${result.qualifiedLeads.length} verified leads found. No credits consumed.`,
          qualifiedLeadsFound: result.qualifiedLeads.length,
          deliveredLeadIds: result.qualifiedLeads.map((l) => l.id),
          completedAt: new Date().toISOString(),
          log: `Insufficient candidates met the qualification criteria (${result.qualifiedLeads.length} of ${requestedLeads}). Zero credits deducted.`,
        });
      }
    })
    .catch((err) => {
      console.error('Search job failed:', err);
      db.updateSearchJob(job.id, {
        status: 'FAILED',
        progressPercentage: 100,
        progressMessage: 'Search could not be completed. No credits were consumed.',
        errorMessage: err.message || 'Search execution failed.',
        completedAt: new Date().toISOString(),
        log: `Search failed with error: ${err.message}. No credits consumed.`,
      });
    });

  res.json({
    jobId: job.id,
    status: job.status,
    progressPercentage: job.progressPercentage,
    progressMessage: job.progressMessage,
  });
});

// Polling Search Job Status
app.get('/api/search/jobs/:id', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const job = db.getSearchJob(req.params.id);

  if (!job) {
    res.status(404).json({ error: 'Search job not found' });
    return;
  }

  // Ensure user owns this job
  if (job.userId !== user.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  // If ready, attach preview of the lead summaries
  let leadsPreview: any[] = [];
  if (job.status === 'READY' || job.status === 'PARTIAL') {
    leadsPreview = job.deliveredLeadIds
      .map((id) => db.getLeadById(id))
      .filter(Boolean);
  }

  res.json({
    job,
    leads: leadsPreview,
  });
});

// Atomically Claim & Deliver Leads from Completed Job
app.post('/api/search/jobs/:id/claim', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const job = db.getSearchJob(req.params.id);

  if (!job) {
    res.status(404).json({ error: 'Search job not found' });
    return;
  }

  if (job.userId !== user.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (job.creditsDeducted > 0) {
    // Already claimed
    const delivered = db.getUserDeliveredLeads(user.id).filter((d) => d.batchId === job.id);
    res.json({
      success: true,
      message: 'Batch already claimed.',
      leads: delivered.map((d) => d.lead),
      remainingCredits: db.getUserBalance(user.id),
    });
    return;
  }

  if (job.status !== 'READY') {
    res.status(400).json({
      error: `Cannot deliver leads from a job in "${job.status}" state. Only "READY" batches can be claimed.`,
    });
    return;
  }

  const creditsToDeduct = job.requestedLeads || 5;
  const balance = db.getUserBalance(user.id);

  if (balance < creditsToDeduct) {
    res.status(402).json({
      error: `Insufficient balance (${balance} credits). Need ${creditsToDeduct} credits to unlock this batch.`,
    });
    return;
  }

  // Deduct credits atomically from ledger
  const deductResult = db.deductCredits(
    user.id,
    creditsToDeduct,
    'LEAD_DELIVERY',
    job.id,
    `Delivered batch of ${creditsToDeduct} website opportunity leads for ${job.category} in ${job.city}`
  );

  if (!deductResult.success) {
    res.status(400).json({ error: deductResult.error });
    return;
  }

  // Record delivery and batch association
  const deliveredLeads: any[] = [];
  for (const leadId of job.deliveredLeadIds) {
    const lead = db.getLeadById(leadId);
    if (lead) {
      db.recordLeadDelivery(job.id, user.id, lead.id, job.id);
      deliveredLeads.push(lead);
    }
  }

  db.updateSearchJob(job.id, {
    creditsDeducted: creditsToDeduct,
    log: `Delivered ${deliveredLeads.length} leads to user. Deducted ${creditsToDeduct} credits. Balance now: ${deductResult.newBalance}`,
  });

  res.json({
    success: true,
    message: `Delivered ${deliveredLeads.length} verified website opportunity leads!`,
    creditsDeducted: creditsToDeduct,
    remainingCredits: deductResult.newBalance,
    leads: deliveredLeads,
  });
});

// ----------------------------------------------------
// 6. DELIVERED LEADS VIEW & EXPORT
// ----------------------------------------------------
app.get('/api/leads/my-leads', authMiddleware, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const delivered = db.getUserDeliveredLeads(user.id);
  res.json({
    total: delivered.length,
    leads: delivered,
    disclaimer:
      "Lead information is collected from publicly available business sources. 'No website found' means an official website was not found in the sources checked; it does not guarantee that the business has never had a website.",
  });
});

// ----------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVE
// ----------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadHunter AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

export { app };
export default app;

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
