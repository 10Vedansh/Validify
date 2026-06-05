-- ============================================================================
-- Validify — Complete Database Schema
-- ============================================================================
-- Generated from: prisma/schema.prisma via `prisma migrate diff`
-- Target:       Supabase PostgreSQL (empty database)
-- Usage:        Paste this entire file into Supabase SQL Editor and execute.
-- ============================================================================
--
-- After execution, verify with:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
--   ORDER BY table_name;
--
-- Expected tables (11):
--   api_logs, chat_messages, chat_threads, ideas, payments,
--   pitch_decks, reports, subscriptions, usage_records, users, validations
--
-- ============================================================================

-- Enums -------------------------------------------------------------------

CREATE TYPE "plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

CREATE TYPE "plan_interval" AS ENUM ('MONTHLY', 'ANNUAL');

CREATE TYPE "subscription_status" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'EXPIRED', 'TRIALING');

CREATE TYPE "payment_status" AS ENUM ('SUCCEEDED', 'FAILED', 'PENDING', 'REFUNDED', 'CANCELED');

CREATE TYPE "validation_status" AS ENUM ('DRAFT', 'RUNNING', 'COMPLETE', 'FAILED');

CREATE TYPE "industry" AS ENUM ('AI / ML', 'Fintech', 'Healthtech', 'Climate', 'DevTools', 'Consumer', 'Productivity');

CREATE TYPE "business_model" AS ENUM ('SaaS', 'Marketplace', 'Transactional', 'Usage-based', 'Freemium');

-- Tables -------------------------------------------------------------------

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "plan" "plan" NOT NULL DEFAULT 'FREE',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_token_expires_at" TIMESTAMP(3),
    "refresh_token_hash" TEXT,
    "token_version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "industry" NOT NULL,
    "problem" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "business_model" "business_model" NOT NULL,
    "budget" TEXT,
    "country" TEXT,
    "competitors" TEXT[],
    "notes" TEXT,
    "attachment_url" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "validations" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "validation_status" NOT NULL DEFAULT 'RUNNING',
    "overall_score" INTEGER,
    "market_score" INTEGER,
    "team_score" INTEGER,
    "moat_score" INTEGER,
    "monetization_score" INTEGER,
    "traction_score" INTEGER,
    "risk_score" INTEGER,
    "raw_llm_response" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "validation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "market_score" INTEGER NOT NULL,
    "team_score" INTEGER NOT NULL,
    "moat_score" INTEGER NOT NULL,
    "monetization_score" INTEGER NOT NULL,
    "traction_score" INTEGER NOT NULL,
    "risk_score" INTEGER NOT NULL,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "opportunities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "threats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "competitors" JSONB NOT NULL DEFAULT '[]',
    "roadmap" JSONB NOT NULL DEFAULT '[]',
    "tam" TEXT,
    "sam" TEXT,
    "som" TEXT,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan" "plan" NOT NULL,
    "interval" "plan_interval" NOT NULL DEFAULT 'MONTHLY',
    "status" "subscription_status" NOT NULL DEFAULT 'ACTIVE',
    "stripe_subscription_id" TEXT,
    "stripe_customer_id" TEXT,
    "stripe_subscription_item_id" TEXT,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "trial_ends_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "unit_price" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "stripe_invoice_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "paid_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "api_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "query" TEXT,
    "status_code" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "request_headers" JSONB,
    "request_body" TEXT,
    "response_body" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_threads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "idea_id" TEXT,
    "title" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "tokens_in" INTEGER,
    "tokens_out" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pitch_decks" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pitch_decks_pkey" PRIMARY KEY ("id")
);

-- Unique Constraints -------------------------------------------------------

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");
CREATE UNIQUE INDEX "users_stripe_subscription_id_key" ON "users"("stripe_subscription_id");
CREATE UNIQUE INDEX "reports_validation_id_key" ON "reports"("validation_id");
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- Indexes ------------------------------------------------------------------

CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_plan_idx" ON "users"("plan");
CREATE INDEX "users_stripe_customer_id_idx" ON "users"("stripe_customer_id");

CREATE INDEX "ideas_user_id_idx" ON "ideas"("user_id");
CREATE INDEX "ideas_user_id_industry_idx" ON "ideas"("user_id", "industry");
CREATE INDEX "ideas_user_id_deleted_at_idx" ON "ideas"("user_id", "deleted_at");
CREATE INDEX "ideas_name_idx" ON "ideas"("name");

CREATE INDEX "validations_user_id_idx" ON "validations"("user_id");
CREATE INDEX "validations_idea_id_idx" ON "validations"("idea_id");
CREATE INDEX "validations_user_id_status_idx" ON "validations"("user_id", "status");
CREATE INDEX "validations_user_id_created_at_idx" ON "validations"("user_id", "created_at");

CREATE INDEX "reports_user_id_idx" ON "reports"("user_id");
CREATE INDEX "reports_idea_id_idx" ON "reports"("idea_id");
CREATE INDEX "reports_user_id_created_at_idx" ON "reports"("user_id", "created_at");

CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions"("stripe_subscription_id");
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX "payments_subscription_id_idx" ON "payments"("subscription_id");
CREATE INDEX "payments_user_id_created_at_idx" ON "payments"("user_id", "created_at");
CREATE INDEX "payments_stripe_invoice_id_idx" ON "payments"("stripe_invoice_id");
CREATE INDEX "payments_stripe_payment_intent_id_idx" ON "payments"("stripe_payment_intent_id");

CREATE INDEX "usage_records_user_id_idx" ON "usage_records"("user_id");
CREATE INDEX "usage_records_user_id_action_idx" ON "usage_records"("user_id", "action");
CREATE INDEX "usage_records_user_id_created_at_idx" ON "usage_records"("user_id", "created_at");
CREATE INDEX "usage_records_user_id_action_created_at_idx" ON "usage_records"("user_id", "action", "created_at");

CREATE INDEX "api_logs_created_at_idx" ON "api_logs"("created_at");
CREATE INDEX "api_logs_user_id_created_at_idx" ON "api_logs"("user_id", "created_at");
CREATE INDEX "api_logs_status_code_idx" ON "api_logs"("status_code");
CREATE INDEX "api_logs_path_idx" ON "api_logs"("path");
CREATE INDEX "api_logs_method_path_idx" ON "api_logs"("method", "path");
CREATE INDEX "api_logs_created_at_ttl_idx" ON "api_logs"("created_at");

CREATE INDEX "chat_threads_user_id_idx" ON "chat_threads"("user_id");
CREATE INDEX "chat_threads_user_id_updated_at_idx" ON "chat_threads"("user_id", "updated_at");

CREATE INDEX "chat_messages_thread_id_idx" ON "chat_messages"("thread_id");
CREATE INDEX "chat_messages_thread_id_created_at_idx" ON "chat_messages"("thread_id", "created_at");

CREATE INDEX "pitch_decks_user_id_idx" ON "pitch_decks"("user_id");
CREATE INDEX "pitch_decks_report_id_idx" ON "pitch_decks"("report_id");
CREATE INDEX "pitch_decks_user_id_created_at_idx" ON "pitch_decks"("user_id", "created_at");

-- Foreign Keys -------------------------------------------------------------

ALTER TABLE "ideas" ADD CONSTRAINT "ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "validations" ADD CONSTRAINT "validations_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "validations" ADD CONSTRAINT "validations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reports" ADD CONSTRAINT "reports_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_validation_id_fkey" FOREIGN KEY ("validation_id") REFERENCES "validations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pitch_decks" ADD CONSTRAINT "pitch_decks_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pitch_decks" ADD CONSTRAINT "pitch_decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
