-- PostgreSQL Schema for ClarityCommerce (claritycommerce.cc) Model Router
-- Run this in your Supabase SQL Editor.

-- Idempotent Enum types creation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'abstract_capability') THEN
        CREATE TYPE abstract_capability AS ENUM ('execution', 'strategy', 'verification');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'model_provider') THEN
        CREATE TYPE model_provider AS ENUM ('deepseek', 'google', 'anthropic');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canary_status') THEN
        CREATE TYPE canary_status AS ENUM ('canarying', 'graduated', 'rolled_back');
    END IF;
END$$;

-- Model Catalog Table
CREATE TABLE IF NOT EXISTS model_catalog (
    id SERIAL PRIMARY KEY,
    model_identifier VARCHAR(64) UNIQUE NOT NULL,
    provider model_provider NOT NULL,
    base_m_token_cost_input NUMERIC(8,4) NOT NULL,
    base_m_token_cost_output NUMERIC(8,4) NOT NULL,
    bfcl_score NUMERIC(5,2) DEFAULT 0.00,
    chatbot_arena_elo INTEGER DEFAULT 1000,
    structured_output_accuracy NUMERIC(5,4) DEFAULT 0.0000,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Capability Mapping Table
CREATE TABLE IF NOT EXISTS capability_mappings (
    capability abstract_capability PRIMARY KEY,
    current_production_model_id INTEGER REFERENCES model_catalog(id) ON DELETE RESTRICT,
    canary_model_id INTEGER REFERENCES model_catalog(id) ON DELETE SET NULL,
    canary_percentage INTEGER DEFAULT 0 CHECK (canary_percentage BETWEEN 0 AND 100),
    budget_limit_per_1k_tokens_usd NUMERIC(6,4) DEFAULT 0.0200 NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Canary Rollouts Table
CREATE TABLE IF NOT EXISTS canary_rollouts (
    id SERIAL PRIMARY KEY,
    capability abstract_capability NOT NULL,
    baseline_model_id INTEGER REFERENCES model_catalog(id) NOT NULL,
    canary_model_id INTEGER REFERENCES model_catalog(id) NOT NULL,
    traffic_percentage INTEGER DEFAULT 10 NOT NULL CHECK (traffic_percentage BETWEEN 0 AND 100),
    status canary_status DEFAULT 'canarying' NOT NULL,
    initiated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    error_rate_threshold NUMERIC(4,3) DEFAULT 0.010 NOT NULL,
    latency_increase_tolerance_ms INTEGER DEFAULT 250 NOT NULL
);

-- Model Performance Logs Table
CREATE TABLE IF NOT EXISTS model_performance_logs (
    id BIGSERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES model_catalog(id) NOT NULL,
    latency_ms INTEGER NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    execution_cost NUMERIC(10,8) NOT NULL,
    is_error BOOLEAN DEFAULT FALSE NOT NULL,
    error_code VARCHAR(32),
    logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Conversations Table (for storing chat history per tenant)
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance and all foreign keys
CREATE INDEX IF NOT EXISTS idx_mappings_prod_model ON capability_mappings(current_production_model_id);
CREATE INDEX IF NOT EXISTS idx_mappings_canary_model ON capability_mappings(canary_model_id);
CREATE INDEX IF NOT EXISTS idx_rollouts_baseline_model ON canary_rollouts(baseline_model_id);
CREATE INDEX IF NOT EXISTS idx_rollouts_canary_model ON canary_rollouts(canary_model_id);
CREATE INDEX IF NOT EXISTS idx_perf_logs_model_time ON model_performance_logs(model_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_active ON model_catalog(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);

-- Enable Row Level Security (RLS) on all tables for Supabase production stability
ALTER TABLE model_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE canary_rollouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create Permissive Select/Insert Rules (AS PERMISSIVE, not OVERMISSIVE)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select read on models') THEN
        CREATE POLICY "Allow public select read on models" ON model_catalog AS PERMISSIVE FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select read on mappings') THEN
        CREATE POLICY "Allow public select read on mappings" ON capability_mappings AS PERMISSIVE FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select read on rollouts') THEN
        CREATE POLICY "Allow public select read on rollouts" ON canary_rollouts AS PERMISSIVE FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous insert on performance logs') THEN
        CREATE POLICY "Allow anonymous insert on performance logs" ON model_performance_logs AS PERMISSIVE FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access on performance logs') THEN
        CREATE POLICY "Allow public access on performance logs" ON model_performance_logs AS PERMISSIVE FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous read/write on conversations') THEN
        CREATE POLICY "Allow anonymous read/write on conversations" ON conversations AS PERMISSIVE FOR ALL USING (true) WITH CHECK (true);
    END IF;
END$$;

-- Timestamp update helper functions
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up trigger creation idempotently without DROP triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_capability_mappings_last_updated') THEN
        CREATE TRIGGER trigger_update_capability_mappings_last_updated
            BEFORE UPDATE ON capability_mappings
            FOR EACH ROW
            EXECUTE FUNCTION update_last_updated_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_conversations_updated_at') THEN
        CREATE TRIGGER trigger_update_conversations_updated_at
            BEFORE UPDATE ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION update_timestamp_column();
    END IF;
END$$;

-- Seed Data with ON CONFLICT upserts
INSERT INTO model_catalog (model_identifier, provider, base_m_token_cost_input, base_m_token_cost_output, bfcl_score, chatbot_arena_elo, structured_output_accuracy) VALUES
('deepseek-chat-v3', 'deepseek'::model_provider, 0.14, 0.28, 91.24, 1285, 0.9850),
('gemini-2.5-pro', 'google'::model_provider, 1.25, 5.00, 88.50, 1290, 0.9650),
('claude-sonnet-4-20250514', 'anthropic'::model_provider, 3.00, 15.00, 90.10, 1315, 0.9910)
ON CONFLICT (model_identifier) DO UPDATE SET
    provider = EXCLUDED.provider,
    base_m_token_cost_input = EXCLUDED.base_m_token_cost_input,
    base_m_token_cost_output = EXCLUDED.base_m_token_cost_output,
    bfcl_score = EXCLUDED.bfcl_score,
    chatbot_arena_elo = EXCLUDED.chatbot_arena_elo,
    structured_output_accuracy = EXCLUDED.structured_output_accuracy;

-- Set up capability mappings (using explicit casting ::abstract_capability)
INSERT INTO capability_mappings (capability, current_production_model_id, canary_model_id, canary_percentage, budget_limit_per_1k_tokens_usd) 
SELECT 'execution'::abstract_capability, id, NULL, 0, 0.0200 FROM model_catalog WHERE model_identifier = 'deepseek-chat-v3'
UNION ALL
SELECT 'strategy'::abstract_capability, id, NULL, 0, 0.0500 FROM model_catalog WHERE model_identifier = 'gemini-2.5-pro'
UNION ALL
SELECT 'verification'::abstract_capability, id, NULL, 0, 0.0800 FROM model_catalog WHERE model_identifier = 'claude-sonnet-4-20250514'
ON CONFLICT (capability) DO UPDATE SET
    current_production_model_id = EXCLUDED.current_production_model_id,
    canary_model_id = EXCLUDED.canary_model_id,
    canary_percentage = EXCLUDED.canary_percentage,
    budget_limit_per_1k_tokens_usd = EXCLUDED.budget_limit_per_1k_tokens_usd;
