"use client";

import React, { useState, useEffect } from "react";
import { Cpu, RotateCw, Activity, Sparkles, Filter, CheckCircle2, ChevronRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface ModelRecord {
  model_identifier: string;
  provider: string;
  is_active: boolean;
  base_m_token_cost_input: number;
}

interface PerformanceLog {
  id: string;
  model_id: number;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  is_error: boolean;
  logged_at: string;
}

interface RouterStatusPanelProps {
  onQueryConcierge: (prompt: string) => void;
}

export default function RouterStatusPanel({ onQueryConcierge }: RouterStatusPanelProps) {
  const [activeCatalog, setActiveCatalog] = useState<ModelRecord[]>([
    { model_identifier: "deepseek-chat-v3", provider: "deepseek", is_active: true, base_m_token_cost_input: 0.14 },
    { model_identifier: "gemini-2.5-pro", provider: "google", is_active: true, base_m_token_cost_input: 1.25 },
    { model_identifier: "claude-sonnet-4-20250514", provider: "anthropic", is_active: true, base_m_token_cost_input: 3.00 }
  ]);

  const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>([
    { id: "101", model_id: 1, latency_ms: 1840, input_tokens: 350, output_tokens: 410, is_error: false, logged_at: "14:32:00" },
    { id: "102", model_id: 2, latency_ms: 1100, input_tokens: 120, output_tokens: 280, is_error: false, logged_at: "14:30:00" },
    { id: "103", model_id: 3, latency_ms: 2240, input_tokens: 580, output_tokens: 610, is_error: false, logged_at: "14:28:10" },
    { id: "104", model_id: 1, latency_ms: 1710, input_tokens: 210, output_tokens: 190, is_error: false, logged_at: "14:25:00" },
    { id: "105", model_id: 3, latency_ms: 2100, input_tokens: 410, output_tokens: 480, is_error: false, logged_at: "14:20:00" }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"catalog" | "telemetry">("telemetry");
  const [dbStateMsg, setDbStateMsg] = useState<string>("Cached offline telemetry links active");

  // Attempt live DB Fetch of model performance metrics
  const fetchLiveMetrics = async () => {
    setIsLoading(true);
    setDbStateMsg("Connecting to Supabase production database instance...");
    try {
      const supabase = getSupabaseClient();
      
      const [performanceRes, catalogRes] = await Promise.all([
        supabase.from("model_performance_logs").select("*").order("logged_at", { ascending: false }).limit(20),
        supabase.from("model_catalog").select("*").eq("is_active", true)
      ]);

      if (performanceRes.error) {
        throw new Error(performanceRes.error.message);
      }

      if (performanceRes.data && performanceRes.data.length > 0) {
        setPerformanceLogs(performanceRes.data as any[]);
        setDbStateMsg("Successfully synchronized live DB logs");
      } else {
        setDbStateMsg("Telemetry table is currently empty. Showing local emulator logs instead.");
      }

      if (catalogRes.data && catalogRes.data.length > 0) {
        setActiveCatalog(catalogRes.data as any[]);
      }
    } catch (err: any) {
      console.warn("⚠️ Postgres connection offline or unconfigured:", err.message);
      setDbStateMsg("Offline Emulator Sandbox is active. Safe stub analytics are online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  // Compute average metrics for local display
  const totalCount = performanceLogs.length;
  const avgLatency = Math.round(performanceLogs.reduce((acc, curr) => acc + curr.latency_ms, 0) / (totalCount || 1));
  const errorCount = performanceLogs.filter((p) => p.is_error).length;

  return (
    <div id="router-status-panel" className="p-6 space-y-6 overflow-y-auto h-full text-left max-w-5xl mx-auto select-none">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-wider text-zinc-900 dark:text-white uppercase flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <span>AI Model Router Status</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Dynamic request router metrics. Inspect latency distributions, canary split logs, and token pricing costs instantly.
          </p>
        </div>

        <button
          onClick={fetchLiveMetrics}
          disabled={isLoading}
          className="bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-350 hover:text-zinc-900 dark:text-white font-mono text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 cursor-pointer self-start md:self-center"
        >
          <RotateCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Synchronize Live Database</span>
        </button>
      </div>

      {/* Database Connection Trace Notice */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg py-2 px-3 flex items-center justify-between text-[11px] font-mono select-none">
        <span className="text-zinc-500 dark:text-zinc-400">PostgreSQL Status:</span>
        <span className="text-indigo-400 font-bold">{dbStateMsg}</span>
      </div>

      {/* Grid: Live Router Splits and Active Model Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left widget column: Production Splits Ratio Card */}
        <div className="md:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-4 text-indigo-400 animate-pulse" />
            <span>Active Canary Rollouts</span>
          </h3>

          <div className="space-y-4">
            {[
              { cap: "Execution", model: "Execution Engine", split: "100% Core Active", status: "Graduated", color: "bg-emerald-550 border-emerald-800" },
              { cap: "Strategy", model: "Strategy Engine", split: "100% Core Active", status: "Graduated", color: "bg-indigo-650 border-indigo-800" },
              { cap: "Verification", model: "Verification Engine", split: "10% Canary Split active", status: "Canarying", color: "bg-amber-550 border-amber-800" }
            ].map((node, i) => (
              <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3.5 rounded-lg text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-350">{node.cap}</span>
                  <span className="text-[9.5px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full font-mono">{node.status}</span>
                </div>
                
                {/* Simulated split bar indicator */}
                <div className="h-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-full mt-2.5 overflow-hidden">
                  <div className={`h-full rounded-full ${
                    node.cap === "Verification" ? "bg-amber-500 w-[10%]" : "bg-indigo-500 w-full"
                  }`} />
                </div>
                
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 block font-mono">{node.split}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right widget column: Model Performance Sparkline Ledger */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Latency Distribution Telemetry</span>
              <span className="text-[10px] text-zinc-550 lowercase">Sparkline distribution timeline</span>
            </h3>

            {/* Custom SVG Line Sparkline Graph representing latency distribution */}
            <div className="h-28 bg-white dark:bg-zinc-950 border border-zinc-855 rounded-lg flex items-end p-2 relative overflow-hidden select-none">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M 0 25 Q 25 10 50 18 T 100 5"
                  className="stroke-indigo-400 fill-none"
                  strokeWidth="1.5"
                />
                <circle cx="0" cy="25" r="2" className="fill-indigo-550" />
                <circle cx="50" cy="18" r="2" className="fill-indigo-400" />
                <circle cx="100" cy="5" r="2" className="fill-emerald-400 animate-ping" />
              </svg>
              
              <div className="absolute top-2 left-2 text-[9.5px] font-mono text-zinc-500 dark:text-zinc-400 flex gap-4">
                <span>Peak: 2,240ms</span>
                <span>Average: {avgLatency}ms</span>
                <span>Errors: {errorCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded-lg text-left">
                <span className="text-[9.5px] uppercase font-mono text-zinc-500 dark:text-zinc-400 block">Average Latency</span>
                <span className="text-lg font-bold font-mono text-indigo-400 mt-1 block">{avgLatency} ms</span>
              </div>
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded-lg text-left">
                <span className="text-[9.5px] uppercase font-mono text-zinc-500 dark:text-zinc-400 block">Total Requests</span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1 block">{totalCount} runs</span>
              </div>
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded-lg text-left">
                <span className="text-[9.5px] uppercase font-mono text-zinc-500 dark:text-zinc-400 block">Network uptime</span>
                <span className="text-lg font-bold font-mono text-emerald-450 mt-1 block">99.98%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onQueryConcierge("Compare current latency averages and model execution pricing budgets.")}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:text-white mt-4 py-2 rounded-lg text-xs font-medium font-mono cursor-pointer transition-colors"
          >
            Run Router Performance Benchmark Suite
          </button>
        </div>
      </div>

      {/* Model Performance Logs Table Ledger */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 select-text">
        <h3 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-4">
          Trace Execution logs
        </h3>

        <div className="overflow-x-auto select-text">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-850 font-mono text-[9.5px] uppercase tracking-wider">
                <th className="p-3">Reference Log Id</th>
                <th className="p-3">Resolved engine identifier</th>
                <th className="p-3 text-center">Latency response</th>
                <th className="p-3 text-center">Input / Output tokens</th>
                <th className="p-3 text-right">Standard status check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 select-text">
              {performanceLogs.map((log) => {
                const engineName = log.model_id === 1 ? "Execution Engine" : log.model_id === 2 ? "Strategy Engine" : "Verification Engine";
                return (
                  <tr key={log.id} className="hover:bg-white dark:bg-zinc-950 transition-colors">
                    <td className="p-3 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">#{log.id} • {log.logged_at}</td>
                    <td className="p-3">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{engineName}</div>
                      <div className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">Clarity Commerce Engine</div>
                    </td>
                    <td className="p-3 text-center font-mono font-medium text-zinc-700 dark:text-zinc-300">{log.latency_ms} ms</td>
                    <td className="p-3 text-center font-mono text-zinc-450">{log.input_tokens} / {log.output_tokens}</td>
                    <td className="p-3 text-right select-none">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                        log.is_error 
                          ? "bg-rose-950 text-rose-455 border border-rose-900/30" 
                          : "bg-emerald-950 text-emerald-450 border border-emerald-900/30"
                      }`}>
                        {log.is_error ? "FAILED" : "COMPLIANT"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

