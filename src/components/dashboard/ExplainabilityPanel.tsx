"use client";

import React, { useState } from "react";
import { Compass, Sparkles, AlertCircle, RefreshCw, Key, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

interface DecisionCard {
  id: string;
  timestamp: string;
  capability: "strategy" | "execution" | "verification";
  actionTaken: string;
  reasoningChain: {
    observation: string;
    pattern: string;
    alternatives: string;
    conclusion: string;
  };
  complianceStatus: string;
  confidence: number; // percentage
}

interface ExplainabilityPanelProps {
  onQueryConcierge: (prompt: string) => void;
}

export default function ExplainabilityPanel({ onQueryConcierge }: ExplainabilityPanelProps) {
  const [filterCap, setFilterCap] = useState<"all" | "strategy" | "execution" | "verification">("all");
  const [decisions, setDecisions] = useState<DecisionCard[]>([
    {
      id: "dec-1",
      timestamp: "2026-05-29 14:12 UTC",
      capability: "strategy",
      actionTaken: "Flagged competitor price matching under-pricing threat.",
      reasoningChain: {
        observation: "GlowAura dropped their facial sunscreen listing price to $18.99.",
        pattern: "Highly aggressive undercut match pattern (~15% below category baseline).",
        alternatives: "A) Match price exactly. B) Stay fixed. C) Match dynamically but add complementary value pack offers.",
        conclusion: "Selected (C) to protect absolute margins while maintaining cross-platform market share indexes."
      },
      complianceStatus: "PASSED: Multi-platform standard pricing check verified.",
      confidence: 94
    },
    {
      id: "dec-2",
      timestamp: "2026-05-29 11:45 UTC",
      capability: "execution",
      actionTaken: "Generated SEO alt tag metadata updates for eco purifiers gallery.",
      reasoningChain: {
        observation: "Three primary gallery assets loaded in Shopify lacked valid alt text metadata.",
        pattern: "Google Image botanical searches represent 12% of referer domain leads.",
        alternatives: "A) Hardcode static SKU placeholders. B) Generate rich semantic descriptive descriptors.",
        conclusion: "Selected (B) to optimize organic semantic image indexing structures."
      },
      complianceStatus: "PASSED: Content check verified no spam keywords.",
      confidence: 98
    },
    {
      id: "dec-3",
      timestamp: "2026-05-28 17:30 UTC",
      capability: "verification",
      actionTaken: "Blocked proposed clinical claim update: 'guarantees wrinkles drop in 5 days'.",
      reasoningChain: {
        observation: "User input included strong clinical medical guarantees without FTC/FDA disclosures.",
        pattern: "Amazon crawler bots automatically suspend clinical skincare claims lacking backing paperwork.",
        alternatives: "A) Sync draft copy. B) Hold check & prompt user for backing medical-grade certificates.",
        conclusion: "Selected (B) to isolate storefront from sudden listing suspensions."
      },
      complianceStatus: "PROHIBITED CLAIM SUSPENDED IN DRAFT STATE",
      confidence: 100
    }
  ]);

  const filtered = filterCap === "all" ? decisions : decisions.filter((d) => d.capability === filterCap);

  return (
    <div id="explainability-panel" className="p-6 space-y-6 overflow-y-auto h-full text-left max-w-5xl mx-auto select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-wider text-zinc-900 dark:text-white uppercase flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-400" />
            <span>Explainable AI (Cognitive Audit Ledger)</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Browse intermediate reasoning steps. ClarityCommerce displays full contextual cognitive loops (Radical Transparency).
          </p>
        </div>

        <button
          onClick={() => onQueryConcierge("Explain how you route and resolve commerce skills dynamically.")}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-350 hover:text-zinc-900 dark:text-white font-mono text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all self-start md:self-center"
        >
          <HelpCircle className="h-4 w-4" />
          <span>How routing reasoning works</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 py-1">
        <div className="flex bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-0.5">
          {["all", "strategy", "execution", "verification"].map((cap) => (
            <button
              key={cap}
              onClick={() => setFilterCap(cap as any)}
              className={`px-3 py-1.5 rounded-md text-[10.5px] font-mono uppercase tracking-wider font-semibold cursor-pointer transition-all whitespace-nowrap ${
                filterCap === cap
                  ? "bg-indigo-650 text-zinc-900 dark:text-white shadow-md font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {cap}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-zinc-650 font-mono">Showing {filtered.length} cognitive audit logs</span>
      </div>

      {/* Timeline List of Decisions */}
      <div className="space-y-6 select-text">
        {filtered.map((dec) => (
          <div key={dec.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden shadow-lg select-text">
            {/* Decision Header */}
            <div className="p-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                  dec.capability === "strategy"
                    ? "bg-indigo-950 text-indigo-400 border-indigo-900/40"
                    : dec.capability === "execution"
                    ? "bg-emerald-950 text-emerald-450 border-emerald-900/40"
                    : "bg-amber-950 text-amber-450 border-amber-910/40"
                }`}>
                  {dec.capability.toUpperCase()} ENGINE
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">{dec.actionTaken}</span>
              </div>

              <div className="flex items-center gap-2 text-right">
                <span className="text-[10px] font-mono text-zinc-650">{dec.timestamp}</span>
                <div className="h-2 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden inline-block border border-zinc-200 dark:border-zinc-900">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${dec.confidence}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">{dec.confidence}% confidence</span>
              </div>
            </div>

            {/* Decision Mind Map step-by-step reasoning steps */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-zinc-900">
              {[
                { label: "1. Data Observation", text: dec.reasoningChain.observation, color: "border-indigo-500/30" },
                { label: "2. Identified Pattern", text: dec.reasoningChain.pattern, color: "border-purple-500/30" },
                { label: "3. Alternatives Scanned", text: dec.reasoningChain.alternatives, color: "border-amber-500/30" },
                { label: "4. Autonomous Conclusion", text: dec.reasoningChain.conclusion, color: "border-emerald-500/30" }
              ].map((step, sIdx) => (
                <div key={sIdx} className={`bg-white dark:bg-zinc-950 p-4 rounded-xl border-t-2 ${step.color} relative text-left flex flex-col justify-between min-h-[140px]`}>
                  <div>
                    <span className="text-[9.5px] font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block mb-2">{step.label}</span>
                    <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">{step.text}</p>
                  </div>
                  {sIdx < 3 && (
                    <ArrowRight className="absolute -right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-800 hidden md:block z-20 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>

            {/* Decision Compliance Verdict Footer row */}
            <div className="px-5 py-3 bg-white dark:bg-zinc-950/40 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-sans">Compliance Status:</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-mono tracking-tight font-bold">{dec.complianceStatus}</span>
              </div>
              <button
                onClick={() => onQueryConcierge(`Deep dive cognitive audit explanation for decision record id [${dec.id}]`)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono font-bold hover:underline cursor-pointer"
              >
                Inspect detailed audit →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

