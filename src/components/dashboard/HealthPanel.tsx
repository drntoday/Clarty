"use client";

import React from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  Percent, 
  DollarSign, 
  AlertOctagon, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  CheckCircle, 
  RefreshCw 
} from "lucide-react";

interface HealthPanelProps {
  onQueryConcierge: (prompt: string) => void;
}

export default function HealthPanel({ onQueryConcierge }: HealthPanelProps) {
  
  const stats = [
    {
      title: "Total Revenue",
      value: "$142,500.50",
      change: "+12.4%",
      isPositive: true,
      sub: "vs previous 30 days",
      icon: DollarSign,
      color: "text-emerald-450 bg-emerald-950/20 border-emerald-900/40"
    },
    {
      title: "Sales Orders",
      value: "1,910 units",
      change: "+8.2%",
      isPositive: true,
      sub: "Completed successfully",
      icon: ShoppingBag,
      color: "text-blue-450 bg-blue-950/20 border-blue-900/40"
    },
    {
      title: "Conversion Rate",
      value: "3.42%",
      change: "-0.4%",
      isPositive: false,
      sub: "Checkout drop off rate ~12%",
      icon: Percent,
      color: "text-amber-450 bg-amber-950/20 border-amber-900/40"
    },
    {
      title: "Average Order Value",
      value: "$74.80",
      change: "+1.9%",
      isPositive: true,
      sub: "Propelled by bundlings",
      icon: TrendingUp,
      color: "text-indigo-450 bg-indigo-950/20 border-indigo-900/40"
    }
  ];

  const anomalies = [
    {
      type: "severe",
      title: "eBay Sync Latency on Special SKUs",
      desc: "API Listing sync reported timeout on eBay store SKU CLARITY-COSMIC-009. Safe baseline price was upheld.",
      time: "20 minutes ago"
    },
    {
      type: "moderate",
      title: "Sudden Organic Traffic Surge",
      desc: "Traffic spike (+40%) detected. Root cause matched Perplexity citations generated for 'sustainable eco purifiers'.",
      time: "2 hours ago"
    },
    {
      type: "compliant",
      title: "Automatic TOS Price Guard Propped",
      desc: "Compliance scan verified multi-platform standard pricing update. No listing violations detected.",
      time: "1 day ago"
    }
  ];

  return (
    <div id="health-panel" className="p-6 space-y-6 overflow-y-auto h-full text-left max-w-5xl mx-auto select-none">
      {/* Title & Diagnostic Trigger Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-wider text-zinc-900 dark:text-white uppercase">Store Health & Analytics</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Visualized analytics overview. Run advanced telemetry audits in compliance with ClarityCommerce principles.
          </p>
        </div>
        
        <button
          onClick={() => onQueryConcierge("Run a baseline store intelligence health diagnostics check across all multi-platform Shopify and Amazon channels.")}
          className="bg-indigo-650 hover:bg-indigo-600 text-zinc-900 dark:text-white font-mono text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 border border-indigo-400 shadow-lg cursor-pointer transition-all self-start md:self-center"
        >
          <Sparkles className="h-4 w-4" />
          <span>Run AI Health Check</span>
        </button>
      </div>

      {/* Stats Board Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const IconComp = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{s.title}</span>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${s.color}`}>
                  <IconComp className="h-4 w-4" />
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight">{s.value}</span>
                <div className="flex items-center gap-1 mt-1 text-[10px]">
                  {s.isPositive ? (
                    <span className="text-emerald-400 font-bold flex items-center">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {s.change}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      {s.change}
                    </span>
                  )}
                  <span className="text-zinc-500 dark:text-zinc-400">{s.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Channels Sync Monitor Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5">
        <h3 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 tracking-wider uppercase mb-4 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Platform Connector Status (Sync Core Active)</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { platform: "Shopify Storefront", live: true, synced: "Sync Live • 2 min ago", value: "Verified Active Link" },
            { platform: "Amazon Seller API", live: true, synced: "Sync Live • 12 min ago", value: "TOS Compliant Guard" },
            { platform: "eBay Merchant Hub", live: true, synced: "Sync Live • 4 min ago", value: "Flat-rate price synced" }
          ].map((ch, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">{ch.platform}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 block">{ch.synced}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] bg-emerald-950 text-emerald-400 font-mono border border-emerald-900/50 px-2 py-0.5 rounded-full">
                  OK
                </span>
                <span className="text-[9px] text-zinc-650 font-mono tracking-tight">{ch.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies, Action Blocks & Incidents Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Anomalies Radar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            <span>AI Diagnostic Engine Logs (Anomaly Watch)</span>
          </h3>

          <div className="space-y-3">
            {anomalies.map((an, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3.5 rounded-lg flex gap-3 text-left">
                <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                  an.type === "severe" ? "bg-rose-500" : an.type === "moderate" ? "bg-amber-500" : "bg-emerald-555"
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{an.title}</span>
                    <span className="text-[9px] font-mono text-zinc-600">{an.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">{an.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Action Sandbox info */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-indigo-450" />
              <span>Self-Regulating Protocol</span>
            </h3>
            <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
              ClarityCommerce is designed to audit listing compliance dynamically. No micro-transactions, no billing hidden credits. Flat rate predictable coverage inside:
            </p>
            <div className="mt-4 p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg text-center space-y-1">
              <span className="text-indigo-400 text-xs font-mono font-bold block">Starter Plan: $9.90/mo</span>
              <span className="text-[9.5px] text-zinc-550 font-medium block">Flat Rate predictable billing covers infinite API sync updates</span>
            </div>
          </div>

          <button
            onClick={() => onQueryConcierge("Check the compliance rule list and pricing flat-rates for scale models.")}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:text-white mt-4 py-2 rounded-lg text-xs font-bold font-mono tracking-tight cursor-pointer transition-colors"
          >
            Review Pricing Plans
          </button>
        </div>
      </div>
    </div>
  );
}

