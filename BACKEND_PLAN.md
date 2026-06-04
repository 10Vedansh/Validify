# Validify — Backend Architecture Plan

## 1. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | Node.js 22+ (or Bun) | Same ecosystem as frontend, fast cold start |
| **Framework** | Hono (v4+) | Lightweight, Cloudflare Workers-compatible, fast, TypeScript-native |
| **API Style** | RESTful (with streaming for chat) | Matches frontend Axios expectations |
| **ORM** | Prisma v6 | Type-safe, migrations, great PostgreSQL support |
| **Database** | PostgreSQL 16 (via Neon or Supabase) | Reliable, JSONB for flexible score/competitor data |
| **Auth** | JWT (access + refresh tokens) | Stateless, matches frontend bearer token pattern |
| **LLM Gateway** | OpenRouter API | Single API for multiple LLMs (GPT-4, Claude, Gemini), fallback support |
| **Payments** | Stripe | Subscriptions, usage metering, webhooks |
| **Validation** | Zod (shared schemas with frontend) | Same validation on both sides |
| **File Storage** | R2 (Cloudflare) or S3-compatible | For uploaded pitch decks, research files |
| **PDF Generation** | Puppeteer or @react-pdf/renderer or Gotenberg | Server-side PDF from report HTML |
| **Email** | Resend or SendGrid | Transactional emails (password reset, reports) |
| **Logging** | Pino | Structured JSON logging, low overhead |
| **Hosting** | Cloudflare Workers + Neon (DB) | Edge-deployed API, globally fast |
| **CI/CD** | GitHub Actions | Lint, test, migrate, deploy |

---

## 2. Folder Structure

```
backend/
├── src/
│   ├── index.ts                    # App entry — create Hono app, register middleware & routes
│   ├── config/
│   │   ├── env.ts                  # Typed env vars via Zod (VITE_API_URL, DATABASE_URL, etc.)
│   │   ├── constants.ts            # App-wide constants (pricing limits, rate limits, etc.)
│   │   └── cors.ts                 # CORS config for frontend origin
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification, attach user to context
│   │   ├── validate.middleware.ts   # Zod schema validation helper
│   │   ├── rate-limit.middleware.ts # Rate limiting per user/IP
│   │   ├── error-handler.middleware.ts  # Global error catch → normalized ApiError
│   │   └── request-logger.middleware.ts # Pino request logging
│   │
│   ├── routes/
│   │   ├── auth.routes.ts           # /auth/* — login, register, logout, me, forgot-password
│   │   ├── ideas.routes.ts          # /ideas/* — CRUD, validate
│   │   ├── reports.routes.ts        # /reports/* — list, get, export PDF
│   │   ├── chat.routes.ts           # /chat/threads/* — threads, messages (streaming)
│   │   ├── user.routes.ts           # /me — profile update
│   │   ├── upload.routes.ts         # /upload — file uploads
│   │   └── webhooks.routes.ts       # /webhooks/* — Stripe, etc.
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── ideas.controller.ts
│   │   ├── reports.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── user.controller.ts
│   │   └── webhooks.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts          # Password hashing, JWT creation/verification, session mgmt
│   │   ├── ideas.service.ts         # Idea CRUD business logic
│   │   ├── validation.service.ts    # Orchestrates AI validation (score + SWOT + competitors)
│   │   ├── reports.service.ts       # Report assembly, PDF export
│   │   ├── chat.service.ts          # Chat thread management, streaming LLM calls
│   │   ├── user.service.ts          # Profile updates
│   │   ├── openrouter.service.ts    # LLM API calls via OpenRouter
│   │   ├── stripe.service.ts        # Subscription, billing, usage metering
│   │   ├── pdf.service.ts           # PDF generation
│   │   ├── upload.service.ts        # File storage (R2/S3)
│   │   └── email.service.ts         # Transactional email sending
│   │
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── jwt.ts                   # Sign / verify helpers
│   │   ├── password.ts              # Hash / compare via bcrypt
│   │   ├── errors.ts                # Custom error classes (AppError, NotFoundError, etc.)
│   │   ├── pagination.ts            # Offset-based pagination helper
│   │   └── logger.ts                # Pino logger instance
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts           # Zod schemas for login, register, forgot-password
│   │   ├── idea.schema.ts           # Zod schemas for idea creation + validation
│   │   ├── chat.schema.ts           # Zod schemas for chat message
│   │   ├── user.schema.ts           # Zod schemas for profile update
│   │   └── common.schema.ts         # Shared pagination, ID params
│   │
│   ├── types/
│   │   ├── context.ts               # Hono context with user, requestId, etc.
│   │   └── openrouter.ts            # OpenRouter request/response types
│   │
│   └── utils/
│       ├── swot-generator.ts        # Parse LLM output into structured SWOT
│       ├── score-calculator.ts      # Normalize LLM scores into 0-100 validation scores
│       ├── competitor-parser.ts     # Extract competitor data from LLM response
│       ├── roadmap-generator.ts     # Generate roadmap from idea + industry
│       └── prompt-builder.ts        # Build system/user prompts for each feature
│
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Auto-generated migration files
│
├── scripts/
│   ├── seed.ts                      # Seed data for development
│   └── reset.ts                     # Reset database helper
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── routes/
│   └── helpers/
│       └── setup.ts                 # Test DB setup, factories
│
├── .env.example
├── wrangler.jsonc                   # Cloudflare Workers config (if deploying on Workers)
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. Database Design (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Users ──────────────────────────────────────────────────────────

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String   @map("password_hash")
  avatarUrl    String?  @map("avatar_url")
  plan         Plan     @default(FREE)
  stripeCustomerId String? @map("stripe_customer_id")
  stripeSubscriptionId String? @map("stripe_subscription_id")
  emailVerified Boolean @default(false) @map("email_verified")
  resetToken   String?  @map("reset_token")
  resetTokenExpiresAt DateTime? @map("reset_token_expires_at")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  ideas       Idea[]
  validations Validation[]
  reports     Report[]
  chatThreads ChatThread[]
  pitchDecks  PitchDeck[]
  apiKeys     ApiKey[]

  @@map("users")
}

// ─── Ideas ──────────────────────────────────────────────────────────

enum Industry {
  AI_ML         @map("AI / ML")
  FINTECH
  HEALTHTECH
  CLIMATE
  DEVTOOLS
  CONSUMER
  PRODUCTIVITY
}

enum BusinessModel {
  SAAS
  MARKETPLACE
  TRANSACTIONAL
  USAGE_BASED
  FREEMIUM
}

model Idea {
  id           String        @id @default(cuid())
  userId       String        @map("user_id")
  name         String
  industry     Industry
  problem      String
  audience     String
  businessModel BusinessModel @map("business_model")
  budget       String?
  country      String?
  competitors  String[]       // Simple list of URLs/names
  notes        String?
  attachmentUrl String?       @map("attachment_url")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  validations  Validation[]
  reports      Report[]
  pitchDecks   PitchDeck[]

  @@map("ideas")
}

// ─── Validations ────────────────────────────────────────────────────

enum ValidationStatus {
  DRAFT
  RUNNING
  COMPLETE
  FAILED
}

model Validation {
  id                   String           @id @default(cuid())
  ideaId               String           @map("idea_id")
  userId               String           @map("user_id")
  status               ValidationStatus @default(RUNNING)
  overallScore         Int?             @map("overall_score")
  marketScore          Int?             @map("market_score")
  teamScore            Int?             @map("team_score")
  moatScore            Int?             @map("moat_score")
  monetizationScore    Int?             @map("monetization_score")
  tractionScore        Int?             @map("traction_score")
  riskScore            Int?             @map("risk_score")
  rawLlmResponse       Json?            @map("raw_llm_response") // Full LLM output for audit
  errorMessage         String?          @map("error_message")
  startedAt            DateTime         @default(now()) @map("started_at")
  completedAt          DateTime?        @map("completed_at")
  createdAt            DateTime         @default(now()) @map("created_at")

  idea                 Idea             @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  user                 User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  report               Report?

  @@index([userId])
  @@index([ideaId])
  @@map("validations")
}

// ─── Reports ────────────────────────────────────────────────────────

model Report {
  id          String   @id @default(cuid())
  ideaId      String   @map("idea_id")
  validationId String  @unique @map("validation_id")
  userId      String   @map("user_id")
  title       String
  summary     String
  industry    String
  strengths   String[] // SWOT
  weaknesses  String[]
  opportunities String[]
  threats     String[]
  competitors Json     // [{ name, score, url? }]
  roadmap     Json     // [{ quarter, label }]
  tam         String?  // Market sizing
  sam         String?
  som         String?
  pdfUrl      String?  @map("pdf_url")
  createdAt   DateTime @default(now()) @map("created_at")

  idea        Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  validation  Validation @relation(fields: [validationId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([ideaId])
  @@map("reports")
}

// ─── Chat ───────────────────────────────────────────────────────────

model ChatThread {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  ideaId    String?  @map("idea_id")
  title     String
  updatedAt DateTime @updatedAt @map("updated_at")
  createdAt DateTime @default(now()) @map("created_at")

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  idea      Idea?        @relation(fields: [ideaId], references: [id])
  messages  ChatMessage[]

  @@index([userId])
  @@map("chat_threads")
}

model ChatMessage {
  id        String   @id @default(cuid())
  threadId  String   @map("thread_id")
  role      String   // "user" | "assistant" | "system"
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  thread    ChatThread @relation(fields: [threadId], references: [id], onDelete: Cascade)

  @@index([threadId])
  @@map("chat_messages")
}

// ─── Pitch Decks ────────────────────────────────────────────────────

model PitchDeck {
  id        String   @id @default(cuid())
  ideaId    String   @map("idea_id")
  userId    String   @map("user_id")
  name      String
  slideCount Int     @default(10) @map("slide_count")
  fileUrl   String?  @map("file_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  idea      Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("pitch_decks")
}

// ─── API Keys ───────────────────────────────────────────────────────

model ApiKey {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  name      String
  keyPrefix String   @map("key_prefix") // First 8 chars for display
  keyHash   String   @map("key_hash")   // bcrypt hash of full key
  lastUsedAt DateTime? @map("last_used_at")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([keyHash])
  @@index([userId])
  @@map("api_keys")
}

// ─── Usage Tracking (for billing metering) ──────────────────────────

model UsageRecord {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  action      String   // "validation" | "chat_message" | "deck_export" | "pdf_export"
  metadata    Json?    // { ideaId?, threadId?, tokens_used?, model? }
  createdAt   DateTime @default(now()) @map("created_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("usage_records")
}
```

### Entity Relationship Diagram (summary)

```
User ──1:N──> Idea
User ──1:N──> Validation
User ──1:N──> Report
User ──1:N──> ChatThread ──1:N──> ChatMessage
User ──1:N──> PitchDeck
User ──1:N──> ApiKey
User ──1:N──> UsageRecord

Idea ──1:N──> Validation ──1:1──> Report
Idea ──1:N──> PitchDeck
Idea ──1:N──> ChatThread
```

---

## 4. Authentication Architecture

### Flow

```
┌────────┐   POST /auth/login    ┌────────┐   Verify    ┌─────────┐
│ Client │   {email, password}   │ Auth   │ ──────────> │ Database │
│        │ ───────────────────>  │ Service │  bcrypt    │ (users) │
│        │                      │         │ <────────── │         │
│        │ <───────────────────  │         │  user row  │         │
│        │  {user, accessToken, │ └────────┘            └─────────┘
│        │   refreshToken}       │
│        │                      │
│        │  Store in localStorage│
│        │  (via Zustand persist)│
└────────┘                      │
                                 │
   Subsequent requests:          │
   Authorization: Bearer <token> │
```

### Token Strategy

| Token | Storage | Lifespan | Purpose |
|---|---|---|---|
| Access Token (JWT) | Client memory / localStorage | 15 minutes | Authenticate API requests |
| Refresh Token (JWT) | Client localStorage | 7 days | Obtain new access tokens |

### JWT Payload

```typescript
// Access Token
{
  sub: "u_abc123",          // User ID
  email: "ada@validify.dev",
  plan: "pro",
  iat: 1717000000,
  exp: 1717000900            // +15 min
}

// Refresh Token
{
  sub: "u_abc123",
  tokenVersion: 3,           // Incremented on password change for invalidation
  iat: 1717000000,
  exp: 1717604800            // +7 days
}
```

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account, return tokens |
| POST | `/auth/login` | No | Verify credentials, return tokens |
| POST | `/auth/refresh` | No* | Exchange refresh token for new access token |
| POST | `/auth/logout` | Yes | Invalidate refresh token (optional blacklist) |
| GET | `/auth/me` | Yes | Get current user profile |
| POST | `/auth/forgot-password` | No | Send password reset email |
| POST | `/auth/reset-password` | No | Reset password with token from email |

*Uses refresh token in request body, not Bearer header.

### Auth Middleware Behavior

```typescript
// Pseudocode
async function authMiddleware(c, next) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid token");
  }

  const token = header.slice(7);
  const payload = await verifyAccessToken(token);
  if (!payload) {
    throw new UnauthorizedError("Token expired or invalid");
  }

  c.set("userId", payload.sub);
  c.set("userPlan", payload.plan);
  await next();
}
```

---

## 5. Report Generation Flow

This is the core product workflow. It involves multiple coordinated steps.

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  User    │     │  Validation   │     │  OpenRouter  │     │  Report     │
│  submits │ ──> │  Service     │ ──> │  Service     │ ──> │  Builder    │
│  idea    │     │              │     │              │     │             │
└──────────┘     └──────────────┘     └──────────────┘     └─────────────┘
                         │                     │                    │
                         v                     v                    v
                   ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
                   │  Create      │     │  5 parallel  │     │  Assemble   │
                   │  Validation  │     │  LLM calls   │     │  Report +   │
                   │  (status:    │     │              │     │  save PDF   │
                   │   RUNNING)   │     └──────────────┘     └─────────────┘
                   └──────────────┘                              │
                                                                 v
                                                           ┌─────────────┐
                                                           │  Update     │
                                                           │  Validation │
                                                           │  (COMPLETE) │
                                                           └─────────────┘
```

### Step-by-step

1. **User submits idea** via `POST /ideas/:id/validate`
2. **Validation service** creates a `Validation` record with `status: RUNNING`
3. **Validation service** launches 5 parallel LLM calls via OpenRouter:
   - **SWOT Analysis**: Prompt: "Given this startup idea, generate strengths, weaknesses, opportunities, threats"
   - **Score Calculation**: Prompt: "Rate this idea 0-100 on market, team, moat, monetization, traction, risk"
   - **Competitor Detection**: Prompt: "Identify 4-5 direct and lateral competitors with scores"
   - **Market Sizing**: Prompt: "Estimate TAM, SAM, SOM for this idea"
   - **Roadmap Generation**: Prompt: "Suggest a 4-quarter product roadmap"
4. **Report builder** parses all LLM responses (using utility parsers), normalizes scores, and assembles the `Report` record
5. **Validation** status updated to `COMPLETE`
6. **(Optional)** PDF generation kicked off asynchronously — stores URL on the Report record
7. **Frontend** polls or receives the completed report via `GET /reports/:id`

### Parallel LLM Call Pattern

```typescript
// services/validation.service.ts (pseudocode)
async function runValidation(idea: Idea): Promise<Report> {
  const validation = await prisma.validation.create({
    data: { ideaId: idea.id, userId: idea.userId, status: "RUNNING" },
  });

  try {
    const [swotResult, scoreResult, competitorResult, marketResult, roadmapResult] =
      await Promise.all([
        openrouterService.generateSWOT(idea),
        openrouterService.generateScores(idea),
        openrouterService.generateCompetitors(idea),
        openrouterService.generateMarketSizing(idea),
        openrouterService.generateRoadmap(idea),
      ]);

    const swot = parseSWOT(swotResult);
    const scores = parseScores(scoreResult);
    const competitors = parseCompetitors(competitorResult);
    const market = parseMarketSizing(marketResult);
    const roadmap = parseRoadmap(roadmapResult);

    const report = await prisma.report.create({
      data: {
        ideaId: idea.id,
        validationId: validation.id,
        userId: idea.userId,
        title: `${idea.name} — Investor Report`,
        summary: generateSummary(idea, scores, swot),
        industry: idea.industry,
        ...swot,
        competitors,
        roadmap,
        tam: market.tam,
        sam: market.sam,
        som: market.som,
      },
    });

    await prisma.validation.update({
      where: { id: validation.id },
      data: { status: "COMPLETE", completedAt: new Date(), ...scores },
    });

    // Fire-and-forget PDF generation
    pdfService.generateReportPdf(report.id).catch(console.error);

    return report;
  } catch (error) {
    await prisma.validation.update({
      where: { id: validation.id },
      data: { status: "FAILED", errorMessage: (error as Error).message },
    });
    throw error;
  }
}
```

---

## 6. OpenRouter Integration Flow

### Configuration

```typescript
// config/env.ts
const envSchema = z.object({
  OPENROUTER_API_KEY: z.string(),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o"),
  OPENROUTER_FALLBACK_MODEL: z.string().default("anthropic/claude-3.5-sonnet"),
  OPENROUTER_BASE_URL: z.string().default("https://openrouter.ai/api/v1"),
});
```

### Service Architecture

```typescript
// services/openrouter.service.ts

interface LLMRequest {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
}

interface LLMResponse {
  id: string;
  choices: { message: { content: string }; finish_reason: string }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}
```

### Key Features

1. **JSON Mode**: All structured generation requests use `{ responseFormat: { type: "json_object" } }` so the output is parseable
2. **Fallback Model**: If primary model fails, retry with fallback model
3. **Token Tracking**: Every call logs token usage to `UsageRecord` for billing
4. **Abort Support**: Long-running generations can be aborted if the validation is cancelled
5. **Prompt Library**: All prompts are centralized in `utils/prompt-builder.ts`

### Prompt Templates (stored in `utils/prompt-builder.ts`)

```typescript
const SYSTEM_SWOT = `You are an expert startup analyst. Given an idea, generate a structured SWOT analysis.
Respond ONLY with valid JSON in this exact format:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "opportunities": ["..."],
  "threats": ["..."]
}`;

const SYSTEM_SCORES = `You are a venture capital analyst. Rate this startup idea on 6 dimensions (0-100).
Respond ONLY with valid JSON in this exact format:
{
  "market": 0-100,
  "team": 0-100,
  "moat": 0-100,
  "monetization": 0-100,
  "traction": 0-100,
  "risk": 0-100
}`;

const SYSTEM_COMPETITORS = `Identify 4-5 direct and lateral competitors for this startup idea. Score each 0-100.
Respond ONLY with valid JSON as an array of { "name": "string", "score": number, "url"?: "string" }`;
```

### Streaming Chat

For the AI co-founder chat, the OpenRouter service uses the streaming API:

```typescript
// services/chat.service.ts (pseudocode)
async *streamReply(
  threadId: string,
  content: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const thread = await prisma.chatThread.findUniqueOrThrow({
    where: { id: threadId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: -50 } },
  });

  // Save user message
  await prisma.chatMessage.create({
    data: { threadId, role: "user", content },
  });

  // Build context from history
  const messages = buildChatContext(thread.messages);

  // Stream from OpenRouter
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: OPENROUTER_MODEL, messages, stream: true }),
    signal,
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      const json = JSON.parse(line.slice(6));
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) {
        fullContent += delta;
        yield delta;
      }
    }
  }

  // Save full assistant response
  await prisma.chatMessage.create({
    data: { threadId, role: "assistant", content: fullContent },
  });
}
```

---

## 7. Stripe Integration Flow

### Pricing Model

| Plan | Monthly Price | Validations | AI Tokens | Deck Exports | Chat Rate |
|---|---|---|---|---|---|
| **Free** | $0 | 3/mo | 100K/mo | 2/mo | 10 msg/hr |
| **Pro** | $29/mo | Unlimited | 3M/mo | 50/mo | 100 msg/hr |
| **Enterprise** | Custom | Unlimited | Custom | Unlimited | Unlimited |

### Subscription Lifecycle

```
┌────────┐                    ┌──────────┐                     ┌────────┐
│ Client │                    │  Backend │                     │ Stripe │
│  (FE)  │                    │          │                     │        │
└───┬────┘                    └────┬─────┘                     └───┬────┘
    │                              │                               │
    │  1. Click "Go Pro"           │                               │
    │ ───────────────────────────> │                               │
    │                              │  2. Create checkout session   │
    │                              │ ─────────────────────────────>│
    │                              │  3. Return session URL        │
    │                              │ <─────────────────────────────│
    │  4. Redirect to Stripe       │                               │
    │ <─────────────────────────── │                               │
    │                              │                               │
    │  5. User fills payment       │                               │
    │    ──────────────────────────────────────────────────────>   │
    │                              │                               │
    │  6. Redirect back to app     │                               │
    │ ─────────────────────────────────────────────────────────>   │
    │                              │                               │
    │  7. Webhook: checkout.session.completed                      │
    │                              │ <─────────────────────────────│
    │                              │  8. Update user plan → PRO    │
    │  9. UI reflects new plan     │                               │
    │ <─────────────────────────── │                               │
```

### Webhook Events to Handle

| Stripe Event | Action |
|---|---|
| `checkout.session.completed` | Set user plan to PRO, store subscription ID |
| `customer.subscription.updated` | Sync plan changes (upgrade/downgrade) |
| `customer.subscription.deleted` | Downgrade user to FREE plan |
| `invoice.payment_failed` | Send email, update subscription status |
| `invoice.paid` | Reset usage counters |

### Usage Metering

```typescript
// services/stripe.service.ts (pseudocode)
async function reportUsage(userId: string, action: string, quantity: number = 1) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.stripeSubscriptionId) return; // Free tier — no metering to Stripe

  // Record in our database
  await prisma.usageRecord.create({
    data: { userId, action, metadata: { quantity } },
  });

  // Report to Stripe for usage-based billing (if applicable)
  await stripe.subscriptionItems.createUsageRecord(
    user.stripeSubscriptionItemId,
    { quantity, timestamp: Math.floor(Date.now() / 1000) },
  );
}
```

### Plan Enforcement Middleware

```typescript
async function enforcePlan(action: string) {
  return async (c, next) => {
    const userId = c.get("userId");
    const plan = c.get("userPlan");

    const usage = await getCurrentUsage(userId, action);
    const limits = PLAN_LIMITS[plan];

    if (usage >= limits[action]) {
      throw new PaymentRequiredError(`You've reached your ${action} limit. Upgrade to Pro.`);
    }

    await next();
  };
}
```

---

## 8. API Endpoints

### Auth (`/auth`)

| Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/auth/register` | No | 5/min | Create account |
| POST | `/auth/login` | No | 10/min | Sign in |
| POST | `/auth/refresh` | No | 10/min | Refresh access token |
| POST | `/auth/logout` | Yes | 10/min | Log out |
| GET | `/auth/me` | Yes | 30/min | Get current user |
| POST | `/auth/forgot-password` | No | 3/min | Send reset email |
| POST | `/auth/reset-password` | No | 5/min | Reset with token |

### Ideas (`/ideas`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/ideas` | Yes | List user's ideas (paginated) |
| POST | `/ideas` | Yes | Create new idea |
| GET | `/ideas/:id` | Yes | Get idea details |
| PATCH | `/ideas/:id` | Yes | Update idea |
| DELETE | `/ideas/:id` | Yes | Delete idea |
| POST | `/ideas/:id/validate` | Yes | Start validation (checks plan limits) |

### Reports (`/reports`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reports` | Yes | List user's reports (paginated) |
| GET | `/reports/:id` | Yes | Get full report with SWOT, scores, competitors |
| GET | `/reports/:id/export.pdf` | Yes | Download report as PDF |

### Chat (`/chat`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/chat/threads` | Yes | List user's chat threads |
| POST | `/chat/threads` | Yes | Create new thread |
| GET | `/chat/threads/:id` | Yes | Get thread details |
| DELETE | `/chat/threads/:id` | Yes | Delete thread |
| GET | `/chat/threads/:id/messages` | Yes | Get thread messages |
| POST | `/chat/threads/:id/messages` | Yes | Send message (streaming response) |

### Pitch Decks (`/pitch`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/pitch` | Yes | List user's pitch decks |
| POST | `/pitch` | Yes | Generate new pitch deck (AI) |
| GET | `/pitch/:id` | Yes | Get pitch deck details |
| DELETE | `/pitch/:id` | Yes | Delete pitch deck |
| GET | `/pitch/:id/export.pptx` | Yes | Download as PPTX |

### User (`/me`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | Yes | Get profile (alias for `/auth/me`) |
| PATCH | `/me` | Yes | Update name, avatarUrl |
| GET | `/me/api-keys` | Yes | List API keys |
| POST | `/me/api-keys` | Yes | Create API key |
| DELETE | `/me/api-keys/:id` | Yes | Delete API key |
| GET | `/me/usage` | Yes | Get current usage stats |

### Upload (`/upload`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/upload` | Yes | Upload file (max 25MB) → returns URL |

### Webhooks (`/webhooks`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/webhooks/stripe` | Stripe Signature | Handle Stripe events |
| POST | `/webhooks/sendgrid` | Custom Secret | Handle email events |

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check (DB, LLM, storage) |

---

## 9. Middleware

### Execution Order

```
Request
  │
  ├── 1. request-logger.middleware    — Log method, path, duration, status
  ├── 2. cors.middleware              — Set CORS headers for frontend origin
  ├── 3. rate-limit.middleware        — Apply rate limits per IP/user
  │
  ├── 4. auth.middleware (conditional) — Verify JWT on protected routes
  │
  ├── 5. validate.middleware          — Validate request body/params/query via Zod
  │
  ├── 6. route handler (controller)    — Business logic, calls services
  │
  ├── 7. error-handler.middleware     — Catch all errors → normalized JSON response
  │
  └── Response
```

### Auth Middleware

```typescript
// middleware/auth.middleware.ts
export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(401, "AUTH_REQUIRED", "Authentication required");
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verifyAccessToken(token);
    c.set("userId", payload.sub);
    c.set("userPlan", payload.plan);
    c.set("userEmail", payload.email);
  } catch {
    throw new AppError(401, "TOKEN_EXPIRED", "Token expired or invalid");
  }

  await next();
};
```

### Validation Middleware

```typescript
// middleware/validate.middleware.ts
import { z } from "zod";

export const validate = (schema: z.ZodSchema, source: "json" | "query" | "param" = "json") => {
  return async (c: Context, next: Next) => {
    const data = source === "json" ? await c.req.json()
                : source === "query" ? c.req.query()
                : c.req.param();

    const result = schema.safeParse(data);
    if (!result.success) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid request", {
        errors: result.error.flatten(),
      });
    }

    c.set("validated", result.data);
    await next();
  };
};
```

### Rate Limit Middleware

```typescript
// middleware/rate-limit.middleware.ts
// Use Cloudflare Workers rate-limiting natively or a Redis-based solution
// Key: ip:{ip} for unauthenticated, user:{userId} for authenticated
// Window: sliding window via sorted set in Upstash Redis

export const rateLimit = (limit: number, windowMs: number) => {
  return async (c: Context, next: Next) => {
    const key = c.get("userId") ?? c.req.header("CF-Connecting-IP") ?? "anonymous";
    const identifier = `ratelimit:${key}`;

    const { success, remaining } = await checkRateLimit(identifier, limit, windowMs);
    if (!success) {
      throw new AppError(429, "RATE_LIMITED", "Too many requests. Please slow down.");
    }

    c.header("X-RateLimit-Remaining", String(remaining));
    await next();
  };
};
```

---

## 10. Error Handling Strategy

### Custom Error Classes

```typescript
// lib/errors.ts

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, "NOT_FOUND", `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to perform this action") {
    super(403, "FORBIDDEN", message);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message: string) {
    super(402, "PAYMENT_REQUIRED", message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
  }
}
```

### Global Error Handler

```typescript
// middleware/error-handler.middleware.ts
export const errorHandler = async (error: Error, c: Context) => {
  // Log all errors
  logger.error({ err: error, requestId: c.get("requestId") }, error.message);

  if (error instanceof AppError) {
    return c.json(
      {
        message: error.message,
        code: error.code,
        status: error.statusCode,
        details: error.details,
      } satisfies ApiError,
      error.statusCode,
    );
  }

  // Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return c.json(
        { message: "A record with that value already exists", code: "CONFLICT", status: 409 },
        409,
      );
    }
    if (error.code === "P2025") {
      return c.json(
        { message: "Resource not found", code: "NOT_FOUND", status: 404 },
        404,
      );
    }
  }

  // Unexpected errors — don't leak details
  return c.json(
    { message: "Something went wrong. Please try again.", code: "INTERNAL_ERROR", status: 500 },
    500,
  );
};
```

### Normalized Error Response

All errors follow the same shape that the frontend's Axios interceptor expects:

```typescript
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}
```

---

## 11. Logging Strategy

### Logger Setup (Pino)

```typescript
// lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: true } }
      : undefined,
  redact: {
    paths: ["req.headers.authorization", "req.body.password", "req.body.token"],
    censor: "[REDACTED]",
  },
});
```

### Structured Log Fields

Every log entry should include:

| Field | Description | Example |
|---|---|---|
| `requestId` | Correlation ID per request | `req_abc123` |
| `method` | HTTP method | `POST` |
| `path` | Request path | `/auth/login` |
| `status` | Response status code | `200` |
| `duration` | Request duration in ms | `342` |
| `userId` | Authenticated user (if any) | `u_abc123` |
| `error` | Error stack trace (on error) | `...` |
| `service` | Service name | `validation` |
| `llmModel` | OpenRouter model used | `openai/gpt-4o` |
| `tokensUsed` | Token count for LLM calls | `1245` |

### Request Logger Middleware

```typescript
// middleware/request-logger.middleware.ts
export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);

  await next();

  const duration = Date.now() - start;
  logger.info({
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
    userId: c.get("userId"),
  });
};
```

---

## 12. Deployment Architecture

### Option 1: Cloudflare Workers (Recommended)

```
                         ┌──────────────────────────┐
                         │     Cloudflare Workers     │
                         │                           │
                         │  Hono API Server          │
                         │  (Edge-deployed, global)  │
                         │                           │
                         │  src/index.ts             │
                         └──────────┬────────────────┘
                                    │
          ┌─────────────────────────┼──────────────────────────┐
          │                         │                          │
          ▼                         ▼                          ▼
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Neon PostgreSQL  │    │  Upstash Redis   │    │  Cloudflare R2      │
│  (Serverless DB)  │    │  (Rate limit +   │    │  (File storage)     │
│                   │    │   cache + queue)  │    │                     │
└──────────────────┘    └──────────────────┘    └─────────────────────┘
          │                         │                          │
          └─────────────────────────┼──────────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    OpenRouter API     │
                         │  (GPT-4o, Claude,     │
                         │   Gemini, etc.)       │
                         └──────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Stripe API       │
                         │  (Payments, billing)  │
                         └──────────────────────┘
```

### Worker Script Structure

```typescript
// src/index.ts — Hono app entry for Cloudflare Workers
import { Hono } from "hono";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { authRoutes } from "./routes/auth.routes";
import { ideasRoutes } from "./routes/ideas.routes";
import { reportsRoutes } from "./routes/reports.routes";
import { chatRoutes } from "./routes/chat.routes";
import { userRoutes } from "./routes/user.routes";
import { uploadRoutes } from "./routes/upload.routes";
import { webhookRoutes } from "./routes/webhooks.routes";

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use("*", cors({
  origin: ["http://localhost:3000", "https://validify.app"],
  credentials: true,
}));
app.use("*", requestLogger);
app.onError(errorHandler);

// Health
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/ideas", ideasRoutes);
app.route("/api/reports", reportsRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/me", userRoutes);
app.route("/api/upload", uploadRoutes);
app.route("/api/webhooks", webhookRoutes);

export default app;
```

### wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "validify-api",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/index.ts",
  "vars": {
    "VITE_APP_NAME": "Validify"
  },
  "env": {
    "production": {
      "vars": {
        "LOG_LEVEL": "info"
      }
    },
    "development": {
      "vars": {
        "LOG_LEVEL": "debug"
      }
    }
  },
  "r2_buckets": [
    { "binding": "FILE_STORAGE", "bucket_name": "validify-uploads" }
  ]
}
```

### Environment Variables

```env
# .env.example

# Database
DATABASE_URL=postgresql://user:password@host:5432/validify

# JWT
JWT_ACCESS_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-4o
OPENROUTER_FALLBACK_MODEL=anthropic/claude-3.5-sonnet

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Email (Resend)
RESEND_API_KEY=re_...

# File Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=validify-uploads

# Frontend
FRONTEND_URL=http://localhost:3000

# App
NODE_ENV=development
LOG_LEVEL=debug
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy API
on:
  push:
    branches: [main]
    paths: ["backend/**"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run db:migrate     # Run Prisma migrations
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          workingDirectory: backend
          command: deploy
```

---

## Summary of Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Framework** | Hono | Lightweight, Cloudflare Workers-native, TypeScript, fast |
| **Database** | PostgreSQL (Neon) | Relational, JSONB for flexible fields, great Prisma support |
| **ORM** | Prisma | Type-safe, migrations, great DX |
| **Auth** | JWT (access + refresh) | Stateless, matches frontend pattern, no server-side session storage needed |
| **LLM** | OpenRouter | Single API key for multiple models, built-in fallback, token tracking |
| **Payments** | Stripe | Industry standard, subscriptions, webhooks, usage metering |
| **File Storage** | Cloudflare R2 | S3-compatible, no egress fees, same platform as Workers |
| **Validation** | Zod | Shared schemas with frontend for consistency |
| **Deployment** | Cloudflare Workers | Edge-deployed, global, zero cold starts, scales to zero |
| **API Style** | REST + Streaming | Standard REST for CRUD, SSE/streaming for chat |
| **Error Format** | `{ message, code, status, details }` | Matches frontend `ApiError` type exactly |
