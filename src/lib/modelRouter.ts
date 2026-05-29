import { getSupabaseClient } from "./supabaseClient";
import { getRedisClient } from "./redisClient";

// Interfaces mirroring the new SERIAL integer-based database table
export interface DbModel {
  id: number;
  model_identifier: string;
  provider: "deepseek" | "google" | "anthropic";
  base_m_token_cost_input: number;
  base_m_token_cost_output: number;
  bfcl_score: number | null;
  chatbot_arena_elo: number | null;
  structured_output_accuracy: number | null;
  is_active: boolean;
}

export interface CapabilityRule {
  capability: "execution" | "strategy" | "verification";
  primary_model: DbModel;
  backup_model: DbModel;
  canary_model: DbModel | null;
  canary_percentage: number;
  budget_limit_per_1k_tokens_usd: number;
}

// Fallback high-fidelity Model Catalog when database connectivity is absent
const LOCAL_MOCK_CATALOG: DbModel[] = [
  {
    id: 1,
    model_identifier: "deepseek-chat-v3",
    provider: "deepseek",
    base_m_token_cost_input: 0.14,
    base_m_token_cost_output: 0.28,
    bfcl_score: 91.24,
    chatbot_arena_elo: 1285,
    structured_output_accuracy: 0.9850,
    is_active: true,
  },
  {
    id: 2,
    model_identifier: "gemini-2.5-pro",
    provider: "google",
    base_m_token_cost_input: 1.25,
    base_m_token_cost_output: 5.00,
    bfcl_score: 88.50,
    chatbot_arena_elo: 1290,
    structured_output_accuracy: 0.9650,
    is_active: true,
  },
  {
    id: 3,
    model_identifier: "claude-sonnet-4-20250514",
    provider: "anthropic",
    base_m_token_cost_input: 3.00,
    base_m_token_cost_output: 15.00,
    bfcl_score: 90.10,
    chatbot_arena_elo: 1315,
    structured_output_accuracy: 0.9910,
    is_active: true,
  },
];

const LOCAL_MOCK_MAPPINGS: Record<string, { primaryId: number; backupId: number; canaryId: number | null; canaryPercentage: number; limitUsd: number }> = {
  execution: {
    primaryId: 1, // deepseek-chat-v3
    backupId: 2,  // gemini-2.5-pro
    canaryId: null,
    canaryPercentage: 10,
    limitUsd: 0.0200,
  },
  strategy: {
    primaryId: 2, // gemini-2.5-pro
    backupId: 3,  // claude-sonnet-4-20250514
    canaryId: null,
    canaryPercentage: 0,
    limitUsd: 0.0500,
  },
  verification: {
    primaryId: 3, // claude-sonnet-4-20250514
    backupId: 2,  // gemini-2.5-pro
    canaryId: null,
    canaryPercentage: 0,
    limitUsd: 0.0800,
  },
};

/**
 * Deterministic string hash to assign consistent user canary percentages [0..99]
 */
function getDeterministicUserWeight(userId: string): number {
  if (!userId) return 0;
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 100);
}

/**
 * Loads dynamic Model Configs & Router settings from Supabase, or falls back safely
 */
export async function getModelRouterConfig(capability: "execution" | "strategy" | "verification"): Promise<CapabilityRule> {
  const supabase = getSupabaseClient();
  
  try {
    // 1. Fetch tables in a safe, decoupled schema method to bypass complex join failures
    const { data: mappingsData, error: mappingError } = await supabase
      .from("capability_mappings")
      .select("*")
      .eq("capability", capability)
      .maybeSingle();

    if (mappingError || !mappingsData) {
      throw new Error(mappingError?.message || `Capability ${capability} mapping not found.`);
    }

    const { data: catalogData, error: catalogError } = await supabase
      .from("model_catalog")
      .select("*")
      .eq("is_active", true);

    if (catalogError || !catalogData || catalogData.length === 0) {
      throw new Error(catalogError?.message || "Model catalog empty or active nodes unavailable.");
    }

    const resolveDbModel = (id: number | null): DbModel | null => {
      if (id === null) return null;
      const found = catalogData.find((m) => m.id === id);
      return found ? (found as DbModel) : null;
    };

    const primaryModel = resolveDbModel(mappingsData.current_production_model_id);
    if (!primaryModel) {
      throw new Error(`Production model id ${mappingsData.current_production_model_id} is missing in active catalog.`);
    }

    // Build a cross-family fallback map (capability -> preferred backup model identifier)
    const fallbackBackupIdMap = {
      execution: "gemini-2.5-pro",
      strategy: "claude-sonnet-4-20250514",
      verification: "gemini-2.5-pro",
    };
    
    // Choose the preferred fallback ID for the capability
    let fbIdentifier = fallbackBackupIdMap[capability];

    // Select the best available backup that is NOT the primary model
    if (primaryModel.model_identifier === fbIdentifier) {
      fbIdentifier = capability === "strategy" ? "gemini-2.5-pro" : "claude-sonnet-4-20250514";
    }

    let backupModel = (catalogData.find((m) => m.model_identifier === fbIdentifier) as DbModel | undefined);
    if (!backupModel) {
      // Find any active model in catalog that is NOT the primary model
      const altMatch = catalogData.find((m) => m.id !== primaryModel.id);
      backupModel = (altMatch || primaryModel) as DbModel;
    }

    return {
      capability,
      primary_model: primaryModel,
      backup_model: backupModel,
      canary_model: resolveDbModel(mappingsData.canary_model_id),
      canary_percentage: mappingsData.canary_percentage ?? 0,
      budget_limit_per_1k_tokens_usd: Number(mappingsData.budget_limit_per_1k_tokens_usd || 0.0200),
    };
  } catch (err) {
    console.warn(`⚠️ Supabase Query failed, utilizing high-fidelity offline routing catalog. Error: ${(err as any).message}`);
    
    const ruleSetup = LOCAL_MOCK_MAPPINGS[capability];
    const resolveLocalModel = (id: number): DbModel => {
      return LOCAL_MOCK_CATALOG.find((m) => m.id === id) || LOCAL_MOCK_CATALOG[0];
    };

    return {
      capability,
      primary_model: resolveLocalModel(ruleSetup.primaryId),
      backup_model: resolveLocalModel(ruleSetup.backupId),
      canary_model: ruleSetup.canaryId ? resolveLocalModel(ruleSetup.canaryId) : null,
      canary_percentage: ruleSetup.canaryPercentage,
      budget_limit_per_1k_tokens_usd: ruleSetup.limitUsd,
    };
  }
}

/**
 * Core dynamic routing resolution. 
 * Determines whether to serve Baseline production model versus Canary model.
 * Persists persistent canary mappings for a given tenant using Upstash Redis.
 */
export async function selectActiveModelNode(
  capability: "execution" | "strategy" | "verification",
  tenantId: string
): Promise<{ selected: DbModel; baseline: DbModel; isCanary: boolean }> {
  
  const rule = await getModelRouterConfig(capability);
  
  // If there's no canary model or if canary weight is 0%, route to primary directly
  if (!rule.canary_model || rule.canary_percentage <= 0) {
    return { selected: rule.primary_model, baseline: rule.primary_model, isCanary: false };
  }

  // Cost-aware ceiling enforcement: Ensure canary cost doesn't exceed 3x the primary baseline cost
  const baselineCostTotal = rule.primary_model.base_m_token_cost_input + rule.primary_model.base_m_token_cost_output;
  const canaryCostTotal = rule.canary_model.base_m_token_cost_input + rule.canary_model.base_m_token_cost_output;

  if (canaryCostTotal > 3 * baselineCostTotal) {
    console.warn(`🛑 Promotion Blocking: Canary model '${rule.canary_model.model_identifier}' exceeds 3x budget ratio of production model.`);
    return { selected: rule.primary_model, baseline: rule.primary_model, isCanary: false };
  }

  // Attempt to load tenant's persistent canary status from Upstash Redis Cache 
  const redis = getRedisClient();
  const redisKey = `claritycommerce:tenant:${tenantId}:canary:${capability}`;
  
  try {
    const cachedAssignment = await redis.get<string>(redisKey);
    if (cachedAssignment === "canary") {
      return { selected: rule.canary_model, baseline: rule.primary_model, isCanary: true };
    } else if (cachedAssignment === "baseline") {
      return { selected: rule.primary_model, baseline: rule.primary_model, isCanary: false };
    }
  } catch (cacheErr) {
    console.warn("⚠️ Upstash Redis Cache unreachable, falling back to deterministic hashing logic:", cacheErr);
  }

  // Calculate deterministic client-hash assignment weight
  const userHashWeight = getDeterministicUserWeight(tenantId);
  const routeToCanary = userHashWeight < rule.canary_percentage;

  // Persist result in Redis cache for session pinning and stability 
  try {
    await redis.set(redisKey, routeToCanary ? "canary" : "baseline", { ex: 86400 }); // Pin for 24 hours
  } catch (e) {
    // Ignore cache writing errors
  }

  return {
    selected: routeToCanary ? rule.canary_model : rule.primary_model,
    baseline: rule.primary_model,
    isCanary: routeToCanary,
  };
}

/**
 * High-level wrapper required by the guidelines: routeModel(capability, tenantId)
 */
export async function routeModel(
  capability: string,
  tenantId: string
): Promise<{ modelId: string; provider: string; modelRecord: DbModel }> {
  // Normalize input string
  const normalizedCap = (["execution", "strategy", "verification"].includes(capability)
    ? capability
    : "strategy") as "execution" | "strategy" | "verification";

  const { selected } = await selectActiveModelNode(normalizedCap, tenantId);
  
  return {
    modelId: selected.model_identifier,
    provider: selected.provider,
    modelRecord: selected,
  };
}

/**
 * Registers model execution performance metrics safely in PostgreSQL database logs
 */
export async function logModelExecutionPerformance(
  modelIdentifier: string,
  latencyMs: number,
  inputTokens: number,
  outputTokens: number,
  isError: boolean = false,
  errorCode: string | null = null
) {
  const supabase = getSupabaseClient();
  let modelPkId = 1; // Default fallback ID inside model_catalog
  let costEstimate = 0;

  try {
    // Resolve model pk integer ID dynamically
    const { data: modelRecord } = await supabase
      .from("model_catalog")
      .select("id, base_m_token_cost_input, base_m_token_cost_output")
      .eq("model_identifier", modelIdentifier)
      .maybeSingle();

    if (modelRecord) {
      modelPkId = modelRecord.id;
      const inputCost = (inputTokens / 1_000_000) * Number(modelRecord.base_m_token_cost_input);
      const outputCost = (outputTokens / 1_000_000) * Number(modelRecord.base_m_token_cost_output);
      costEstimate = Number((inputCost + outputCost).toFixed(8));
    } else {
      // Offline fallback lookup
      const localMeta = LOCAL_MOCK_CATALOG.find((m) => m.model_identifier === modelIdentifier);
      if (localMeta) {
        modelPkId = localMeta.id;
        const inputCost = (inputTokens / 1_000_000) * localMeta.base_m_token_cost_input;
        const outputCost = (outputTokens / 1_000_000) * localMeta.base_m_token_cost_output;
        costEstimate = Number((inputCost + outputCost).toFixed(8));
      }
    }

    // Insert performance log record
    const { error: logErr } = await supabase.from("model_performance_logs").insert({
      model_id: modelPkId,
      latency_ms: latencyMs,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      execution_cost: costEstimate,
      is_error: isError,
      error_code: errorCode,
    });

    if (logErr) {
      console.error("❌ Failed logging record to model_performance_logs table:", logErr);
    }
  } catch (e) {
    console.warn(`⚠️ Supabase metrics skipped. Input: model=${modelIdentifier}, latency=${latencyMs}ms, error=${isError}`);
  }
}
