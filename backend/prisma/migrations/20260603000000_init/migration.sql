-- ─── Validify — Initial Database Migration ────────────────────────────
-- Generated from prisma/schema.prisma
-- PostgreSQL 16 compatible
-- ───────────────────────────────────────────────────────────────────────

-- Create enums
CREATE TYPE "plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "plan_interval" AS ENUM ('MONTHLY', 'ANNUAL');
CREATE TYPE "subscription_status" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'EXPIRED', 'TRIALING');
CREATE TYPE "payment_status" AS ENUM ('SUCCEEDED', 'FAILED', 'PENDING', 'REFUNDED', 'CANCELED');
CREATE TYPE "validation_status" AS ENUM ('DRAFT', 'RUNNING', 'COMPLETE', 'FAILED');
CREATE TYPE "industry" AS ENUM ('AI / ML', 'Fintech', 'Healthtech', 'Climate', 'DevTools', 'Consumer', 'Productivity');
CREATE TYPE "business_model" AS ENUM ('SaaS', 'Marketplace', 'Transactional', 'Usage-based', 'Freemium');

-- ─── 1. Users ─────────────────────────────────────────────────────────

CREATE TABLE "users" (
    "id"                TEXT        NOT NULL,
    "email"             TEXT        NOT NULL,
    "name"              TEXT        NOT NULL,
    "password_hash"     TEXT        NOT NULL,
    "avatar_url"        TEXT,
    "plan"              "plan"      NOT NULL DEFAULT 'FREE',
    "stripe_customer_id"     TEXT,
    "stripe_subscription_id" TEXT,
    "email_verified"    BOOLEAN     NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMPTZ,
    "reset_token"       TEXT,
    "reset_token_expires_at" TIMESTAMPTZ,
    "refresh_token_hash" TEXT,
    "token_version"     INTEGER     NOT NULL DEFAULT 1,
    "deleted_at"        TIMESTAMPTZ,
    "created_at"        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_stripe_customer_id_key" UNIQUE ("stripe_customer_id"),
    CONSTRAINT "users_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id")
);

CREATE INDEX "users_email_idx" ON "users" ("email");
CREATE INDEX "users_plan_idx" ON "users" ("plan");
CREATE INDEX "users_stripe_customer_id_idx" ON "users" ("stripe_customer_id");

-- ─── 2. Ideas ─────────────────────────────────────────────────────────

CREATE TABLE "ideas" (
    "id"              TEXT            NOT NULL,
    "user_id"         TEXT            NOT NULL,
    "name"            TEXT            NOT NULL,
    "industry"        "industry"      NOT NULL,
    "problem"         TEXT            NOT NULL,
    "audience"        TEXT            NOT NULL,
    "business_model"  "business_model" NOT NULL,
    "budget"          TEXT,
    "country"         TEXT,
    "competitors"     TEXT[]          DEFAULT ARRAY[]::TEXT[],
    "notes"           TEXT,
    "attachment_url"  TEXT,
    "deleted_at"      TIMESTAMPTZ,
    "created_at"      TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "ideas_user_id_idx" ON "ideas" ("user_id");
CREATE INDEX "ideas_user_id_industry_idx" ON "ideas" ("user_id", "industry");
CREATE INDEX "ideas_user_id_deleted_at_idx" ON "ideas" ("user_id", "deleted_at");
CREATE INDEX "ideas_name_idx" ON "ideas" ("name");

-- ─── 3. Validations ───────────────────────────────────────────────────

CREATE TABLE "validations" (
    "id"                 TEXT               NOT NULL,
    "idea_id"            TEXT               NOT NULL,
    "user_id"            TEXT               NOT NULL,
    "status"             "validation_status" NOT NULL DEFAULT 'RUNNING',
    "overall_score"      INTEGER,
    "market_score"       INTEGER,
    "team_score"         INTEGER,
    "moat_score"         INTEGER,
    "monetization_score" INTEGER,
    "traction_score"     INTEGER,
    "risk_score"         INTEGER,
    "raw_llm_response"   JSONB,
    "error_message"      TEXT,
    "started_at"         TIMESTAMPTZ        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at"       TIMESTAMPTZ,
    "created_at"         TIMESTAMPTZ        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "validations_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE,
    CONSTRAINT "validations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "validations_user_id_idx" ON "validations" ("user_id");
CREATE INDEX "validations_idea_id_idx" ON "validations" ("idea_id");
CREATE INDEX "validations_user_id_status_idx" ON "validations" ("user_id", "status");
CREATE INDEX "validations_user_id_created_at_idx" ON "validations" ("user_id", "created_at");

-- ─── 4. Reports ───────────────────────────────────────────────────────

CREATE TABLE "reports" (
    "id"                 TEXT    NOT NULL,
    "idea_id"            TEXT    NOT NULL,
    "validation_id"      TEXT    NOT NULL,
    "user_id"            TEXT    NOT NULL,
    "title"              TEXT    NOT NULL,
    "summary"            TEXT    NOT NULL,
    "industry"           TEXT    NOT NULL,
    "overall_score"      INTEGER NOT NULL,
    "market_score"       INTEGER NOT NULL,
    "team_score"         INTEGER NOT NULL,
    "moat_score"         INTEGER NOT NULL,
    "monetization_score" INTEGER NOT NULL,
    "traction_score"     INTEGER NOT NULL,
    "risk_score"         INTEGER NOT NULL,
    "strengths"          TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
    "weaknesses"         TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
    "opportunities"      TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
    "threats"            TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
    "competitors"        JSONB   NOT NULL DEFAULT '[]'::JSONB,
    "roadmap"            JSONB   NOT NULL DEFAULT '[]'::JSONB,
    "tam"                TEXT,
    "sam"                TEXT,
    "som"                TEXT,
    "pdf_url"            TEXT,
    "created_at"         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reports_validation_id_key" UNIQUE ("validation_id"),
    CONSTRAINT "reports_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE,
    CONSTRAINT "reports_validation_id_fkey" FOREIGN KEY ("validation_id") REFERENCES "validations"("id") ON DELETE CASCADE,
    CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "reports_user_id_idx" ON "reports" ("user_id");
CREATE INDEX "reports_idea_id_idx" ON "reports" ("idea_id");
CREATE INDEX "reports_user_id_created_at_idx" ON "reports" ("user_id", "created_at");

-- ─── 5. Subscriptions ─────────────────────────────────────────────────

CREATE TABLE "subscriptions" (
    "id"                          TEXT                NOT NULL,
    "user_id"                     TEXT                NOT NULL,
    "plan"                        "plan"              NOT NULL,
    "interval"                    "plan_interval"     NOT NULL DEFAULT 'MONTHLY',
    "status"                      "subscription_status" NOT NULL DEFAULT 'ACTIVE',
    "stripe_subscription_id"      TEXT,
    "stripe_customer_id"          TEXT,
    "stripe_subscription_item_id" TEXT,
    "current_period_start"        TIMESTAMPTZ         NOT NULL,
    "current_period_end"          TIMESTAMPTZ         NOT NULL,
    "trial_ends_at"               TIMESTAMPTZ,
    "canceled_at"                 TIMESTAMPTZ,
    "unit_price"                  INTEGER,
    "currency"                    TEXT                NOT NULL DEFAULT 'usd',
    "created_at"                  TIMESTAMPTZ         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"                  TIMESTAMPTZ         NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id"),
    CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" ("user_id");
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions" ("stripe_subscription_id");
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions" ("user_id", "status");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" ("status");

-- ─── 6. Payments ──────────────────────────────────────────────────────

CREATE TABLE "payments" (
    "id"                        TEXT            NOT NULL,
    "user_id"                   TEXT            NOT NULL,
    "subscription_id"           TEXT,
    "stripe_invoice_id"         TEXT,
    "stripe_payment_intent_id"  TEXT,
    "amount"                    INTEGER         NOT NULL,
    "currency"                  TEXT            NOT NULL DEFAULT 'usd',
    "status"                    "payment_status" NOT NULL DEFAULT 'PENDING',
    "description"               TEXT,
    "paid_at"                   TIMESTAMPTZ,
    "refunded_at"               TIMESTAMPTZ,
    "created_at"                TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id")
);

CREATE INDEX "payments_user_id_idx" ON "payments" ("user_id");
CREATE INDEX "payments_subscription_id_idx" ON "payments" ("subscription_id");
CREATE INDEX "payments_user_id_created_at_idx" ON "payments" ("user_id", "created_at");
CREATE INDEX "payments_stripe_invoice_id_idx" ON "payments" ("stripe_invoice_id");
CREATE INDEX "payments_stripe_payment_intent_id_idx" ON "payments" ("stripe_payment_intent_id");

-- ─── 7. Usage Records ─────────────────────────────────────────────────

CREATE TABLE "usage_records" (
    "id"         TEXT        NOT NULL,
    "user_id"    TEXT        NOT NULL,
    "action"     TEXT        NOT NULL,
    "quantity"   INTEGER     NOT NULL DEFAULT 1,
    "metadata"   JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "usage_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "usage_records_user_id_idx" ON "usage_records" ("user_id");
CREATE INDEX "usage_records_user_id_action_idx" ON "usage_records" ("user_id", "action");
CREATE INDEX "usage_records_user_id_created_at_idx" ON "usage_records" ("user_id", "created_at");
CREATE INDEX "usage_records_user_id_action_created_at_idx" ON "usage_records" ("user_id", "action", "created_at");

-- ─── 8. API Logs ──────────────────────────────────────────────────────

CREATE TABLE "api_logs" (
    "id"              TEXT        NOT NULL,
    "user_id"         TEXT,
    "method"          TEXT        NOT NULL,
    "path"            TEXT        NOT NULL,
    "query"           TEXT,
    "status_code"     INTEGER     NOT NULL,
    "duration_ms"     INTEGER     NOT NULL,
    "request_headers" JSONB,
    "request_body"    TEXT,
    "response_body"   TEXT,
    "ip_address"      TEXT,
    "user_agent"      TEXT,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "api_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE INDEX "api_logs_created_at_idx" ON "api_logs" ("created_at");
CREATE INDEX "api_logs_user_id_created_at_idx" ON "api_logs" ("user_id", "created_at");
CREATE INDEX "api_logs_status_code_idx" ON "api_logs" ("status_code");
CREATE INDEX "api_logs_path_idx" ON "api_logs" ("path");
CREATE INDEX "api_logs_method_path_idx" ON "api_logs" ("method", "path");
-- Index for TTL cleanup (delete logs older than 90 days)
CREATE INDEX "api_logs_created_at_ttl_idx" ON "api_logs" ("created_at");

-- ─── 9. Chat Threads ─────────────────────────────────────────────────

CREATE TABLE "chat_threads" (
    "id"         TEXT        NOT NULL,
    "user_id"    TEXT        NOT NULL,
    "idea_id"    TEXT,
    "title"      TEXT        NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "chat_threads_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id")
);

CREATE INDEX "chat_threads_user_id_idx" ON "chat_threads" ("user_id");
CREATE INDEX "chat_threads_user_id_updated_at_idx" ON "chat_threads" ("user_id", "updated_at");

-- ─── 10. Chat Messages ────────────────────────────────────────────────

CREATE TABLE "chat_messages" (
    "id"         TEXT        NOT NULL,
    "thread_id"  TEXT        NOT NULL,
    "role"       TEXT        NOT NULL,
    "content"    TEXT        NOT NULL,
    "model"      TEXT,
    "tokens_in"  INTEGER,
    "tokens_out" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "chat_threads"("id") ON DELETE CASCADE
);

CREATE INDEX "chat_messages_thread_id_idx" ON "chat_messages" ("thread_id");
CREATE INDEX "chat_messages_thread_id_created_at_idx" ON "chat_messages" ("thread_id", "created_at");

