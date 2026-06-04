// ─── Validify — Database Seed ──────────────────────────────────────────
//
// Seeds the database with realistic test data that mirrors the frontend
// mock data in validifyai-main/src/lib/mock.ts.
//
// Run: npx tsx prisma/seed.ts
// ────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean existing data (in dependency order) ──────────────────────

  await prisma.chatMessage.deleteMany();
  await prisma.chatThread.deleteMany();
  await prisma.apiLog.deleteMany();
  await prisma.usage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.report.deleteMany();
  await prisma.validation.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.user.deleteMany();

  // ─── 1. Users ──────────────────────────────────────────────────────

  const ada = await prisma.user.create({
    data: {
      id: "u_001",
      email: "ada@validify.dev",
      name: "Ada Lovelace",
      passwordHash: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmY6VvKcYl6J6f5y7Xq", // "password123"
      plan: "PRO",
      emailVerified: true,
      emailVerifiedAt: new Date("2026-01-15"),
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: "u_002",
      email: "sarah@lumenai.io",
      name: "Sarah Chen",
      passwordHash: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmY6VvKcYl6J6f5y7Xq",
      plan: "FREE",
      emailVerified: true,
      emailVerifiedAt: new Date("2026-02-20"),
    },
  });

  const marcus = await prisma.user.create({
    data: {
      id: "u_003",
      email: "marcus@northcapital.com",
      name: "Marcus Reed",
      passwordHash: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmY6VvKcYl6J6f5y7Xq",
      plan: "ENTERPRISE",
      emailVerified: true,
      emailVerifiedAt: new Date("2026-01-10"),
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: "u_004",
      email: "admin@validify.dev",
      name: "Admin User",
      passwordHash: "$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmY6VvKcYl6J6f5y7Xq",
      plan: "ENTERPRISE",
      isAdmin: true,
      emailVerified: true,
      emailVerifiedAt: new Date("2026-01-01"),
    },
  });

  console.log("  ✓ Users created");

  // ─── 2. Ideas ──────────────────────────────────────────────────────

  const neurodesk = await prisma.idea.create({
    data: {
      id: "idea_001",
      userId: ada.id,
      name: "NeuroDesk",
      industry: "PRODUCTIVITY",
      problem: "Engineering teams lose 4+ hours per week switching between PR reviews, docs, and tickets. Context gets fragmented across tools with no unified AI layer.",
      audience: "Engineering teams at mid-market SaaS companies (50-500 employees)",
      businessModel: "SAAS",
      budget: "$500K seed",
      country: "United States",
      competitors: ["Notion AI", "Mem", "Reflect", "Tana"],
      notes: "Keyboard-first, zero-click AI layer. Founder has strong PLG background from previous exit.",
    },
  });

  const greenloop = await prisma.idea.create({
    data: {
      id: "idea_002",
      userId: ada.id,
      name: "GreenLoop",
      industry: "CLIMATE",
      problem: "Small-to-mid size businesses lack affordable tools to measure and offset their supply chain carbon footprint.",
      audience: "SMBs with 20-500 employees in manufacturing and logistics",
      businessModel: "SAAS",
      budget: "$750K pre-seed",
      country: "Germany",
      competitors: ["Watershed", "Persefoni", "Plan A"],
    },
  });

  const medimatch = await prisma.idea.create({
    data: {
      id: "idea_003",
      userId: sarah.id,
      name: "MediMatch",
      industry: "HEALTHTECH",
      problem: "Patients wait 3-6 weeks for specialist appointments. Current referral systems are manual, paper-based, and inefficient.",
      audience: "Primary care clinics and patients in urban India",
      businessModel: "MARKETPLACE",
      country: "India",
    },
  });

  const lumefin = await prisma.idea.create({
    data: {
      id: "idea_004",
      userId: marcus.id,
      name: "Lumefin",
      industry: "FINTECH",
      problem: "Freelancers struggle to access credit without traditional employment verification.",
      audience: "Freelancers and gig workers in the US and UK",
      businessModel: "TRANSACTIONAL",
      competitors: ["Kabbage", "Fundbox", "Clearco"],
    },
  });

  console.log("  ✓ Ideas created");

  // ─── 3. Validations ────────────────────────────────────────────────

  const neurodeskValidation = await prisma.validation.create({
    data: {
      id: "val_001",
      ideaId: neurodesk.id,
      userId: ada.id,
      status: "COMPLETE",
      overallScore: 86,
      marketScore: 86,
      teamScore: 72,
      moatScore: 78,
      monetizationScore: 64,
      tractionScore: 58,
      riskScore: 70,
      startedAt: new Date("2026-05-20"),
      completedAt: new Date("2026-05-20"),
      rawLlmResponse: { model: "openai/gpt-4o", prompt: "swot+scoring+competitors" },
    },
  });

  const greenloopValidation = await prisma.validation.create({
    data: {
      id: "val_002",
      ideaId: greenloop.id,
      userId: ada.id,
      status: "COMPLETE",
      overallScore: 72,
      marketScore: 78,
      teamScore: 65,
      moatScore: 70,
      monetizationScore: 60,
      tractionScore: 45,
      riskScore: 55,
      startedAt: new Date("2026-05-22"),
      completedAt: new Date("2026-05-22"),
    },
  });

  const medimatchValidation = await prisma.validation.create({
    data: {
      id: "val_003",
      ideaId: medimatch.id,
      userId: sarah.id,
      status: "COMPLETE",
      overallScore: 91,
      marketScore: 94,
      teamScore: 88,
      moatScore: 85,
      monetizationScore: 90,
      tractionScore: 82,
      riskScore: 75,
      startedAt: new Date("2026-05-25"),
      completedAt: new Date("2026-05-25"),
    },
  });

  const lumefinValidation = await prisma.validation.create({
    data: {
      id: "val_004",
      ideaId: lumefin.id,
      userId: marcus.id,
      status: "COMPLETE",
      overallScore: 64,
      marketScore: 70,
      teamScore: 55,
      moatScore: 60,
      monetizationScore: 75,
      tractionScore: 50,
      riskScore: 45,
      startedAt: new Date("2026-05-28"),
      completedAt: new Date("2026-05-28"),
    },
  });

  console.log("  ✓ Validations created");

  // ─── 4. Reports ────────────────────────────────────────────────────

  await prisma.report.create({
    data: {
      id: "rpt_001",
      ideaId: neurodesk.id,
      validationId: neurodeskValidation.id,
      userId: ada.id,
      title: "NeuroDesk — Investor Report",
      summary:
        "NeuroDesk addresses fragmented context across PR reviews, docs, and tickets by stitching a zero-click AI layer into developer workflows. The team shows strong founder–market fit and a credible technical moat, but monetization remains the biggest open question.",
      industry: "Productivity",
      overallScore: 86,
      marketScore: 86,
      teamScore: 72,
      moatScore: 78,
      monetizationScore: 64,
      tractionScore: 58,
      riskScore: 70,
      strengths: ["Strong technical moat", "Founder–market fit", "Low CAC channel identified"],
      weaknesses: ["Unproven monetization", "Single-region team", "No design hire yet"],
      opportunities: ["Regulation tailwind in EU", "Emerging buyer persona", "Partnership with incumbents"],
      threats: ["Well-funded incumbent", "Platform risk on OpenAI", "Long enterprise sales cycle"],
      competitors: JSON.stringify([
        { name: "You", score: 86 },
        { name: "Notion AI", score: 92, url: "https://notion.so" },
        { name: "Mem", score: 74, url: "https://mem.ai" },
        { name: "Reflect", score: 68, url: "https://reflect.app" },
        { name: "Tana", score: 71, url: "https://tana.inc" },
      ]),
      roadmap: JSON.stringify([
        { quarter: "Q1", label: "Closed beta · 25 design partners" },
        { quarter: "Q2", label: "Self-serve · usage-based pricing" },
        { quarter: "Q3", label: "Series Seed · $2.5M" },
        { quarter: "Q4", label: "Enterprise pilots · SOC2 Type I" },
      ]),
      tam: "$4.2B",
      sam: "$920M",
      som: "$180M",
    },
  });

  await prisma.report.create({
    data: {
      id: "rpt_002",
      ideaId: greenloop.id,
      validationId: greenloopValidation.id,
      userId: ada.id,
      title: "GreenLoop — Pre-seed Assessment",
      summary:
        "GreenLoop targets the underserved SMB carbon accounting market. Strong EU regulation tailwind creates urgency, but the competitive landscape is fragmenting rapidly.",
      industry: "Climate",
      overallScore: 72,
      marketScore: 78,
      teamScore: 65,
      moatScore: 70,
      monetizationScore: 60,
      tractionScore: 45,
      riskScore: 55,
      strengths: ["First-mover in SMB segment", "EU regulation tailwind", "Strong advisory board"],
      weaknesses: ["No revenue yet", "Small team (3 founders)", "Limited sales experience"],
      opportunities: ["ESG reporting mandates expanding", "Partnership with accounting platforms"],
      threats: ["Enterprise vendors moving downmarket", "Open-source alternatives emerging"],
      competitors: JSON.stringify([
        { name: "You", score: 72 },
        { name: "Watershed", score: 88, url: "https://watershed.com" },
        { name: "Persefoni", score: 82, url: "https://persefoni.com" },
        { name: "Plan A", score: 76, url: "https://plana.earth" },
      ]),
      roadmap: JSON.stringify([
        { quarter: "Q2", label: "MVP launch · 10 beta customers" },
        { quarter: "Q3", label: "API integrations · Xero, QuickBooks" },
        { quarter: "Q4", label: "Self-serve onboarding · $99/mo" },
      ]),
      tam: "$12.5B",
      sam: "$1.8B",
      som: "$85M",
    },
  });

  console.log("  ✓ Reports created");

  // ─── 5. Subscriptions ──────────────────────────────────────────────

  const adaSubscription = await prisma.subscription.create({
    data: {
      id: "sub_001",
      userId: ada.id,
      plan: "PRO",
      interval: "ANNUAL",
      status: "ACTIVE",
      stripeSubscriptionId: "sub_stripe_pro_001",
      stripeCustomerId: "cus_pro_ada",
      currentPeriodStart: new Date("2026-06-12"),
      currentPeriodEnd: new Date("2027-06-12"),
      unitPrice: 29000, // $290/yr in cents
    },
  });

  await prisma.subscription.create({
    data: {
      id: "sub_002",
      userId: marcus.id,
      plan: "ENTERPRISE",
      interval: "ANNUAL",
      status: "ACTIVE",
      stripeSubscriptionId: "sub_stripe_ent_001",
      stripeCustomerId: "cus_ent_marcus",
      currentPeriodStart: new Date("2026-01-01"),
      currentPeriodEnd: new Date("2027-01-01"),
      unitPrice: 99900, // $999/yr
    },
  });

  console.log("  ✓ Subscriptions created");

  // ─── 6. Payments ───────────────────────────────────────────────────

  await prisma.payment.create({
    data: {
      id: "pay_001",
      userId: ada.id,
      subscriptionId: adaSubscription.id,
      stripeInvoiceId: "in_001",
      stripePaymentIntentId: "pi_001",
      amount: 29000,
      currency: "usd",
      status: "SUCCEEDED",
      description: "Validify Pro — Annual (2026-2027)",
      paidAt: new Date("2026-06-12"),
    },
  });

  await prisma.payment.create({
    data: {
      id: "pay_002",
      userId: marcus.id,
      stripeInvoiceId: "in_002",
      stripePaymentIntentId: "pi_002",
      amount: 99900,
      currency: "usd",
      status: "SUCCEEDED",
      description: "Validify Enterprise — Annual (2026)",
      paidAt: new Date("2026-01-01"),
    },
  });

  console.log("  ✓ Payments created");

  // ─── 7. Usage Records ──────────────────────────────────────────────

  const usageActions = [
    { userId: ada.id, action: "validation", quantity: 1, createdAt: new Date("2026-06-01") },
    { userId: ada.id, action: "validation", quantity: 1, createdAt: new Date("2026-06-02") },
    { userId: ada.id, action: "chat_message", quantity: 12, createdAt: new Date("2026-06-02") },
    { userId: ada.id, action: "deck_export", quantity: 1, createdAt: new Date("2026-06-03") },
    { userId: ada.id, action: "pdf_export", quantity: 2, createdAt: new Date("2026-06-03") },
    { userId: sarah.id, action: "validation", quantity: 1, createdAt: new Date("2026-06-01") },
    { userId: sarah.id, action: "chat_message", quantity: 5, createdAt: new Date("2026-06-01") },
    { userId: marcus.id, action: "validation", quantity: 3, createdAt: new Date("2026-06-02") },
    { userId: marcus.id, action: "chat_message", quantity: 25, createdAt: new Date("2026-06-03") },
  ];

  for (const record of usageActions) {
    await prisma.usage.create({ data: record });
  }

  console.log("  ✓ Usage records created");

  // ─── 8. API Logs ───────────────────────────────────────────────────

  await prisma.apiLog.create({
    data: {
      id: "log_001",
      userId: ada.id,
      method: "POST",
      path: "/api/auth/login",
      statusCode: 200,
      durationMs: 342,
      ipAddress: "203.0.113.42",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    },
  });

  await prisma.apiLog.create({
    data: {
      id: "log_002",
      userId: ada.id,
      method: "GET",
      path: "/api/ideas",
      statusCode: 200,
      durationMs: 28,
      ipAddress: "203.0.113.42",
    },
  });

  await prisma.apiLog.create({
    data: {
      id: "log_003",
      userId: ada.id,
      method: "POST",
      path: "/api/ideas/idea_001/validate",
      statusCode: 202,
      durationMs: 12450,
      ipAddress: "203.0.113.42",
    },
  });

  console.log("  ✓ API logs created");

  // ─── 9. Chat Threads & Messages ────────────────────────────────────

  const thread1 = await prisma.chatThread.create({
    data: {
      id: "thread_001",
      userId: ada.id,
      ideaId: neurodesk.id,
      title: "Pricing for prosumer SaaS",
    },
  });

  const thread2 = await prisma.chatThread.create({
    data: {
      id: "thread_002",
      userId: ada.id,
      ideaId: greenloop.id,
      title: "GTM for vertical AI",
    },
  });

  const thread3 = await prisma.chatThread.create({
    data: {
      id: "thread_003",
      userId: ada.id,
      title: "Cap table simulation",
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        threadId: thread1.id,
        role: "assistant",
        content: "Hey — I'm your AI co-founder. What are we figuring out today?",
      },
      {
        threadId: thread1.id,
        role: "user",
        content: "I'm thinking about pricing for NeuroDesk. What model should I use?",
      },
      {
        threadId: thread1.id,
        role: "assistant",
        content:
          "For a devtools product like NeuroDesk, I'd recommend a hybrid seat + usage model:\n\n1. **Base tier**: $20/seat/mo — core AI features, 1M tokens\n2. **Pro tier**: $50/seat/mo — advanced models, 5M tokens, priority support\n3. **Enterprise**: Custom — SOC2, SSO, on-prem\n\nThis matches what devs expect (predictable base + scale with usage).",
      },
      {
        threadId: thread2.id,
        role: "assistant",
        content: "Let's think about your GTM strategy for GreenLoop. What's your ICP?",
      },
      {
        threadId: thread3.id,
        role: "assistant",
        content: "I can help you model a cap table. What's your target raise?",
      },
    ],
  });

  console.log("  ✓ Chat threads and messages created");

  // ─── Summary ────────────────────────────────────────────────────────

  const counts = {
    users: await prisma.user.count(),
    ideas: await prisma.idea.count(),
    validations: await prisma.validation.count(),
    reports: await prisma.report.count(),
    subscriptions: await prisma.subscription.count(),
    payments: await prisma.payment.count(),
    usageRecords: await prisma.usage.count(),
    apiLogs: await prisma.apiLog.count(),
    chatThreads: await prisma.chatThread.count(),
    chatMessages: await prisma.chatMessage.count(),
  };

  console.log("\n✅ Seed complete — summary:");
  console.table(counts);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
