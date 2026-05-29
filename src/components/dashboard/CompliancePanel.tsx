"use client";

import React, { useState } from "react";
import { ShieldCheck, Target, AlertCircle, FileLock2, Play, Check, HelpCircle } from "lucide-react";

interface PolicyCheck {
  id: string;
  proposedAction: string;
  platform: string;
  status: "SAFE" | "CAUTION" | "HIGH-RISK";
  issue: string | null;
  timestamp: string;
}

interface CompliancePanelProps {
  onQueryConcierge: (prompt: string) => void;
}

export default function CompliancePanel({ onQueryConcierge }: CompliancePanelProps) {
  const [riskScore, setRiskScore] = useState(15);
  const [checks, setChecks] = useState<PolicyCheck[]>([
    {
      id: "chk-1",
      proposedAction: "Listing copy claim: 'Anti-aging serum eliminates fine wrinkles in exactly 7 days guaranteed!'",
      platform: "amazon",
      status: "HIGH-RISK",
      issue: "Exerts definitive clinical drug-like results without qualifying medical-grade FDA disclaimers. Amazon Listing flag hazard.",
      timestamp: "2 hours ago"
    },
    {
      id: "chk-2",
      proposedAction: "Updating pricing dynamically across Shopify and Amazon to match 24h competitor drops.",
      platform: "all-platforms",
      status: "SAFE",
      issue: null,
      timestamp: "1 day ago"
    },
    {
      id: "chk-3",
      proposedAction: "Adding claim: 'Recommended by dermatologists for ultra deep hydration'.",
      platform: "shopify",
      status: "CAUTION",
      issue: "Must upload licensed clinical dermatologist survey documentation to Shopify files block before publishing.",
      timestamp: "3 days ago"
    }
  ]);

  const [proposedText, setProposedText] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("amazon");

  const handlePreFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedText.trim()) return;

    onQueryConcierge(`TOS check: run a pre-flight marketplace compliance check for platform ${selectedPlatform} with proposed copy: "${proposedText}"`);
    setProposedText("");
  };

  return (
    <div id="compliance-panel" className="p-6 space-y-6 overflow-y-auto h-full text-left max-w-5xl mx-auto select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-wider text-zinc-900 dark:text-white uppercase flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-450 animate-pulse" />
            <span>Compliance Guardian</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Pre-flight seller risk evaluation scans. Check listings copywriting against Amazon policy, eBay regulations, and general FTC/FDA codes.
          </p>
        </div>

        <button
          onClick={() => onQueryConcierge("Check all active storefront listing text for FTC and FDA marketing policy compliance.")}
          className="bg-indigo-650 hover:bg-indigo-600 text-zinc-900 dark:text-white font-mono text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 border border-indigo-400 shadow-md cursor-pointer transition-all self-start md:self-center"
        >
          <Target className="h-4 w-4" />
          <span>Synthesize Compliance Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Risk score panel widget - 4 cols */}
        <div className="md:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="space-y-1 w-full text-center">
            <h2 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Overall Risk Score</h2>
            <p className="text-[10px] text-zinc-550 italic">Aggregated platform violation index</p>
          </div>

          {/* SVG Circular Gauge */}
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-zinc-850 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-emerald-450 fill-none transition-all duration-1000"
                strokeWidth="8"
                strokeDasharray="389.5"
                strokeDashoffset={389.5 - (389.5 * (100 - riskScore)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono text-zinc-900 dark:text-white tracking-widest">{riskScore}</span>
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-emerald-450 mt-1">
                Low risk
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-3 w-full text-left space-y-1">
            <span className="text-[10px] font-bold font-mono text-zinc-600 dark:text-zinc-400 block uppercase">Policy Verdict: Secure</span>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Self-correcting pricing engine holds matching indices across global listings. Compliance risks bypassed proactively.
            </p>
          </div>
        </div>

        {/* Copy pre-flight form - 8 cols */}
        <div className="md:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileLock2 className="h-4 text-emerald-450" />
              <span>New Listing Pre-Flight Copywriter</span>
            </h2>
            <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Before syncing clinical or feature upgrades to active Shopify or Amazon Seller accounts, scan proposed descriptions through ClarityCommerce compliance rules.
            </p>
          </div>

          <form onSubmit={handlePreFlight} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { val: "amazon", label: "Amazon TOS Guard" },
                { val: "shopify", label: "Shopify Merchant Policy" },
                { val: "ebay", label: "eBay Regulations" }
              ].map((p) => (
                <button
                  type="button"
                  key={p.val}
                  onClick={() => setSelectedPlatform(p.val)}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-mono tracking-wider font-semibold border text-center transition-all cursor-pointer ${
                    selectedPlatform === p.val
                      ? "bg-emerald-950 border-emerald-800 text-emerald-300 font-bold"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              required
              rows={3}
              value={proposedText}
              onChange={(e) => setProposedText(e.target.value)}
              placeholder="Inject proposed product listing bullet points or advertising tagline..."
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 outline-none resize-none font-sans leading-normal placeholder-zinc-700"
            />

            <button
              type="submit"
              className="bg-indigo-650 hover:bg-indigo-600 border border-indigo-400 text-zinc-900 dark:text-white font-mono text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors w-full"
            >
              <Play className="h-4 w-4" />
              <span>Validate Copywriting Compliance</span>
            </button>
          </form>
        </div>
      </div>

      {/* Recent policy checks table / cards */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5">
        <h3 className="text-xs font-semibold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-4">
          Audit Ledger & Verification History
        </h3>

        <div className="space-y-3">
          {checks.map((chk) => (
            <div 
              key={chk.id} 
              className={`border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-left ${
                chk.status === "HIGH-RISK"
                  ? "bg-rose-950/10 border-rose-900/30"
                  : chk.status === "CAUTION"
                  ? "bg-amber-950/10 border-amber-900/30"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900"
              }`}
            >
              <div className="space-y-1.5 flex-1 select-text">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                    chk.status === "HIGH-RISK"
                      ? "bg-rose-950 text-rose-450 border-rose-900/40"
                      : chk.status === "CAUTION"
                      ? "bg-amber-950 text-amber-450 border-amber-900/40"
                      : "bg-emerald-950 text-emerald-450 border-emerald-900/40"
                  }`}>
                    {chk.status}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-zinc-550">{chk.platform}</span>
                  <span className="text-[10px] text-zinc-650 font-mono">• {chk.timestamp}</span>
                </div>
                
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium font-sans">{chk.proposedAction}</p>
                {chk.issue && (
                  <p className="text-[11px] text-rose-450/80 italic font-sans flex items-start gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />
                    <span>{chk.issue}</span>
                  </p>
                )}
              </div>

              {chk.status === "SAFE" && (
                <div className="h-7 w-7 rounded-full bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-400 shrink-0 select-none">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

