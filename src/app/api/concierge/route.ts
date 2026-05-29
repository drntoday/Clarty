import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { routeModel, logModelExecutionPerformance } from "@/lib/modelRouter";
import { CONCIERGE_SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { ToolsRegistry } from "@/lib/tools";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function packEvent(name: string, data: any): string {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  console.log("CONCIERGE ROUTE VERSION: v3-retry");   // updated marker
  const startTime = Date.now();
  let tenantId = "default-merchant";
  let capTag: "execution" | "strategy" | "verification" = "strategy";

  try {
    const payload = await req.json();
    const { messages } = payload;
    tenantId = payload.tenantId || "default-merchant";

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const lastContent = (messages[messages.length - 1]?.content || "").toLowerCase();

    if (payload.capabilityTag && ["execution", "strategy", "verification"].includes(payload.capabilityTag)) {
      capTag = payload.capabilityTag;
    } else {
      const contentLower = lastContent.toLowerCase();

      const executionKeywords = [
        "write copy", "optimize listing", "generate title", "create description", "a+ content", "alt text",
        "bulk update", "sync listings", "update prices", "change all", "batch edit", "seo audit",
        "meta tags", "search ranking", "keyword gap", "title optimization", "cross platform", "unified view",
        "merge data", "all channels", "multi-platform", "sync", "edit", "update", "write", "draft",
        "modify", "save", "upload", "publish", "builder", "generate content", "listing audit"
      ];

      const verificationKeywords = [
        "compliance", "tos check", "is this allowed", "policy check", "legal review", "fda",
        "verify", "confirm change", "did it work", "execution status", "validate", "tos", "allowed",
        "prohibited", "restriction", "law", "regulation", "legal", "audit check", "term of service",
        "check limit", "security", "safe", "risk assessment", "pre-flight"
      ];

      const strategyKeywords = [
        "analytics", "revenue", "sales data", "store performance", "traffic report", "metrics dashboard",
        "competitor", "analyze url", "competitive analysis", "who competes with", "market share",
        "analyze reviews", "review sentiment", "customer feedback", "what are people saying", "review mining",
        "geo impact", "ai search visibility", "chatgpt citations", "perplexity ranking", "generative engine",
        "seasonal", "holiday forecast", "demand projection", "q4 planning", "peak season", "projection",
        "metrics", "report", "growth", "performance", "forecast", "insight", "sentiment", "trends",
        "sales dropped", "revenue fell", "dashboard", "traffic", "visitor"
      ];

      let execScore = 0;
      let verifyScore = 0;
      let strategyScore = 0;

      for (const kw of executionKeywords) {
        if (contentLower.includes(kw)) execScore += 2;
      }
      for (const kw of verificationKeywords) {
        if (contentLower.includes(kw)) verifyScore += 2;
      }
      for (const kw of strategyKeywords) {
        if (contentLower.includes(kw)) strategyScore += 2;
      }

      if (execScore > strategyScore && execScore >= verifyScore) {
        capTag = "execution";
      } else if (verifyScore > strategyScore && verifyScore > execScore) {
        capTag = "verification";
      } else {
        capTag = "strategy";
      }
    }

    // 1. Fetch live routing resolution from catalog (used for logging / initial selection)
    const { modelId, provider, modelRecord } = await routeModel(capTag, tenantId);

    // --- BUILD PROVIDER LIST FOR RETRY ---
    const providers = [
      {
        name: "google",
        modelId: "gemini-2.5-pro",
        key: process.env.GEMINI_API_KEY,
      },
      {
        name: "anthropic",
        modelId: "claude-sonnet-4-20250514",
        key: process.env.CLAUDE_API_KEY,
      },
      {
        name: "deepseek",
        modelId: "deepseek-chat",
        key: process.env.DEEPSEEK_API_KEY,
      },
    ];

    // Persist session to Supabase conversations
    try {
      const supabase = getSupabaseClient();
      await supabase.from("conversations").insert({
        tenant_id: tenantId,
        messages,
      });
    } catch (dbErr) {
      console.warn("⚠️ Conversations logging bypassed:", (dbErr as any).message);
    }

    // 2. Stream with RETRY logic
    const stream = new ReadableStream({
      async start(controller) {
        let textTokensEst = 0;
        let lastError: string | null = null;
        let finalModelUsed = "unknown";
        let succeeded = false;

        // Try each provider in order, skip if key missing
        for (const p of providers) {
          if (!p.key) continue;

          const activeProvider = p.name;
          const activeModelId = p.modelId;
          finalModelUsed = activeModelId;

          console.log(`🎯 Trying provider: ${activeProvider} (model: ${activeModelId})`);
          controller.enqueue(
            encoder.encode(
              packEvent("routeInfo", { modelId: activeModelId, provider: activeProvider, capability: capTag })
            )
          );

          try {
            // --- TOOL EXECUTION (identical for all providers) ---
            let triggerToolName: keyof typeof ToolsRegistry | null = null;

            const triggers: Record<string, string[]> = {
              get_store_analytics: ["analytics", "revenue", "sales data", "store performance", "traffic report", "metrics dashboard", "aov", "average order value", "cart abandonment", "conversion-rate", "metrics"],
              analyze_competitor: ["competitor", "analyze url", "competitive analysis", "who competes with", "market share", "spy on", "competitors", "scraping competitor"],
              generate_optimized_content: ["write copy", "optimize listing", "generate title", "create description", "a+ content", "alt text", "draft copy", "product text", "rewrite product", "generate content"],
              bulk_update_listings: ["bulk update", "sync listings", "update prices", "change all", "batch edit", "bulk edit", "bulk price", "batch update"],
              check_compliance: ["compliance", "tos check", "is this allowed", "policy check", "legal review", "fda", "prohibited content", "restricted category", "compliance check"],
              audit_seo: ["seo audit", "meta tags", "search ranking", "keyword gap", "title optimization", "seo overview", "keyword targeting"],
              deep_review_analysis: ["analyze reviews", "review sentiment", "customer feedback", "what are people saying", "review mining", "star ratings", "shopper sentiment", "customer reviews"],
              cross_platform_fusion: ["cross platform", "unified view", "merge data", "all channels", "multi-platform", "channel fusion", "channel sync"],
              measure_geo_impact: ["geo impact", "ai search visibility", "chatgpt citations", "perplexity ranking", "generative engine", "ai engine citation", "search visibility"],
              seasonal_baseline: ["seasonal", "holiday forecast", "demand projection", "q4 planning", "peak season", "baseline projection", "demand forecasting", "seasonality"],
              verify_execution: ["verify", "confirm change", "did it work", "execution status", "validate", "check sync status", "verify execution"],
            };

            for (const [tool, keywords] of Object.entries(triggers)) {
              if (keywords.some((kw) => lastContent.includes(kw))) {
                triggerToolName = tool as keyof typeof ToolsRegistry;
                break;
              }
            }

            if (triggerToolName && ToolsRegistry[triggerToolName]) {
              controller.enqueue(encoder.encode(packEvent("toolCallStart", { tool: triggerToolName })));

              const mockArgs: Record<string, any> = {};
              if (triggerToolName === "get_store_analytics") {
                mockArgs.platform = "amazon";
                mockArgs.period = "last_90_days";
              } else if (triggerToolName === "analyze_competitor") {
                mockArgs.url_or_asin = "https://competitor.example-shop.com";
              } else if (triggerToolName === "generate_optimized_content") {
                mockArgs.product_id = "CLARITY-ECO-300";
                mockArgs.goal = "optimize listing descriptions";
              } else if (triggerToolName === "bulk_update_listings") {
                mockArgs.platform = "shopify";
                mockArgs.products = ["CLARITY-ECO-300", "CLARITY-COSMIC-009"];
                mockArgs.changes = { priceAdjustmentPercent: 5 };
              } else if (triggerToolName === "check_compliance") {
                mockArgs.platform = "amazon";
                mockArgs.proposed_action = lastContent || "Add environmental protection/disclaimer text";
              } else if (triggerToolName === "audit_seo") {
                mockArgs.platform = "shopify";
                mockArgs.product_ids = ["CLARITY-ECO-300"];
              } else if (triggerToolName === "deep_review_analysis") {
                mockArgs.platform = "amazon";
                mockArgs.product_id = "CLARITY-ECO-300";
                mockArgs.pages = 3;
              } else if (triggerToolName === "cross_platform_fusion") {
                mockArgs.product_id = "CLARITY-ECO-300";
              } else if (triggerToolName === "measure_geo_impact") {
                mockArgs.domain = "claritycommerce.cc";
                mockArgs.period = "last_30_days";
              } else if (triggerToolName === "seasonal_baseline") {
                mockArgs.platform = "shopify";
                mockArgs.period = "summer_peak";
              } else if (triggerToolName === "verify_execution") {
                mockArgs.action_id = "act-91823-compliance-update";
              }

              const toolOutcome = (ToolsRegistry[triggerToolName] as any)(mockArgs);
              controller.enqueue(encoder.encode(packEvent("toolCallResult", { tool: triggerToolName, outcome: toolOutcome })));
            }

            // --- PROVIDER DISPATCH ---
            if (activeProvider === "google") {
              const ai = new GoogleGenAI({
                apiKey: p.key!,
                httpOptions: { headers: { "User-Agent": "aistudio-build" } },
              });

              const contents = [
                { role: "user" as const, parts: [{ text: CONCIERGE_SYSTEM_PROMPT }] },
                { role: "model" as const, parts: [{ text: "Understood. I run on ClarityCommerce's proprietary engine built by nitishkumar.pro." }] },
                ...messages.map((m: any) => ({
                  role: (m.role === "assistant" ? "model" : m.role) as "user" | "model",
                  parts: [{ text: m.content || "" }],
                })),
              ];

              const responseStream = await ai.models.generateContentStream({
                model: activeModelId,
                contents,
                config: { temperature: 0.15 },
              });

              for await (const chunk of responseStream) {
                const text = chunk.text;
                if (text) {
                  controller.enqueue(encoder.encode(packEvent("text", { text })));
                  textTokensEst += text.split(/\s+/).length;
                }
              }
            } else if (activeProvider === "anthropic") {
              const anthropic = new Anthropic({ apiKey: p.key! });

              const responseStream = await anthropic.messages.create({
                model: activeModelId,
                max_tokens: 1536,
                system: CONCIERGE_SYSTEM_PROMPT,
                messages: messages.map((m: any) => ({
                  role: m.role === "assistant" ? "assistant" : "user",
                  content: m.content || "",
                })),
                stream: true,
              });

              for await (const event of responseStream) {
                if (event.type === "content_block_delta" && (event.delta as any)?.text) {
                  const text = (event.delta as any).text;
                  controller.enqueue(encoder.encode(packEvent("text", { text })));
                  textTokensEst += text.split(/\s+/).length;
                }
              }
            } else {
              // deepseek
              const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${p.key!}`,
                },
                body: JSON.stringify({
                  model: activeModelId,
                  messages: [
                    { role: "system", content: CONCIERGE_SYSTEM_PROMPT },
                    ...messages,
                  ],
                  temperature: 0.15,
                  stream: true,
                }),
              });

              if (!response.ok) {
                const info = await response.text();
                throw new Error(`DeepSeek API server error (${response.status}): ${info}`);
              }

              const reader = response.body?.getReader();
              if (!reader) throw new Error("Unable to open DeepSeek stream reader.");

              const decoderStream = new TextDecoder();
              let partialLine = "";

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoderStream.decode(value, { stream: true });
                const lines = (partialLine + chunk).split("\n");
                partialLine = lines.pop() || "";

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || trimmed === "data: [DONE]") continue;

                  if (trimmed.startsWith("data: ")) {
                    try {
                      const parsed = JSON.parse(trimmed.substring(6));
                      const text = parsed.choices?.[0]?.delta?.content;
                      if (text) {
                        controller.enqueue(encoder.encode(packEvent("text", { text })));
                        textTokensEst += text.split(/\s+/).length;
                      }
                    } catch (_) { }
                  }
                }
              }
            }

            // If we reach here, the call succeeded
            succeeded = true;
            break;
          } catch (err) {
            console.error(`🚨 Provider ${activeProvider} failed:`, (err as any).message);
            lastError = (err as any).message;
            // Continue to next provider
          }
        }

        if (!succeeded) {
          // All providers failed
          const fallbackText = `\n\n**[Adaptive Offline Mode]**
I'm currently operating in a limited capacity because the primary AI service is temporarily unavailable. This is usually resolved within seconds — please try again shortly. If the issue persists, contact your system administrator.

*Executed Capability:* **${capTag.toUpperCase()}**
*Latency:* ${Date.now() - startTime}ms.`;

          for (const word of fallbackText.split(" ")) {
            controller.enqueue(encoder.encode(packEvent("text", { text: word + " " })));
            await new Promise((r) => setTimeout(r, 25));
          }
        }

        const duration = Date.now() - startTime;
        try {
          await logModelExecutionPerformance(
            finalModelUsed,
            duration,
            230,
            Math.max(10, textTokensEst),
            !succeeded,
            lastError
          );
        } catch (_) { }

        controller.enqueue(encoder.encode(packEvent("done", { duration })));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("❌ Root level Next.js Concierge route error:", err);
    return NextResponse.json({ error: err.message || "Execution error" }, { status: 500 });
  }
}