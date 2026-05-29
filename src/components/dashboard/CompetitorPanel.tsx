"use client";

import React, { useState } from "react";
import { Radar, Sparkles, PlusCircle, AlertTriangle, ExternalLink, Globe, Trash2 } from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  url: string;
  asin: string;
  priceIndex: number; // e.g. 1.05 means they are 5% more expensive, 0.90 means they are cheaper
  estimatedTraffic: string;
  alert: string | null;
}

interface CompetitorPanelProps {
  onQueryConcierge: (prompt: string) => void;
}

export default function CompetitorPanel({ onQueryConcierge }: CompetitorPanelProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: "comp-1",
      name: "GlowAura Organics",
      url: "https://glowaura-organics.example.com",
      asin: "B0912X93S2",
      priceIndex: 0.92,
      estimatedTraffic: "65,000 visitors/mo",
      alert: "Price Drop detected. They set anti-aging creams to $24.99 (-12%)."
    },
    {
      id: "comp-2",
      name: "EcoFlora Skincare",
      url: "https://ecoflora-skincare.example.com",
      asin: "B08HG92S4A",
      priceIndex: 1.15,
      estimatedTraffic: "32,000 visitors/mo",
      alert: null
    },
    {
      id: "comp-3",
      name: "SeraCalm Solutions",
      url: "https://seracalm-clinic.example.com",
      asin: "B0BLX18K33",
      priceIndex: 1.02,
      estimatedTraffic: "18,500 visitors/mo",
      alert: "Keyword hijacking detected. Bidding on search terms 'clarity skincare natural'."
    }
  ]);

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAsin, setNewAsin] = useState("");

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newComp: Competitor = {
      id: "comp-" + Date.now(),
      name: newName,
      url: newUrl || "https://example-competitor.com",
      asin: newAsin || "N/A",
      priceIndex: 1.0,
      estimatedTraffic: "Evaluating...",
      alert: null
    };

    setCompetitors((prev) => [...prev, newComp]);
    newName && onQueryConcierge(`Analyze competitor url ${newComp.url} or product ${newComp.asin}. Identify their catalog gaps.`);
    setNewName("");
    setNewUrl("");
    setNewAsin("");
  };

  const handleDelete = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div id="competitor-panel" className="p-6 space-y-6 overflow-y-auto h-full text-left max-w-5xl mx-auto select-none">
      {/* Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5">
        <div>
          <h1 className="text-lg font-bold font-mono tracking-wider text-zinc-900 dark:text-white uppercase flex items-center gap-2">
            <Radar className="h-5 w-5 text-indigo-400" />
            <span>Competitor Intelligence Radar</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track external e-commerce pricing indices, search domain traffic alerts, and direct Amazon ASIN listing gaps.
          </p>
        </div>

        <button
          onClick={() => onQueryConcierge("Analyze the top 3 competitors in face skincare market segment and map competitive pricing indexes.")}
          className="bg-indigo-650 hover:bg-indigo-600 text-zinc-900 dark:text-white font-mono text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 border border-indigo-400 shadow-lg cursor-pointer transition-all self-start md:self-center"
        >
          <Sparkles className="h-4 w-4" />
          <span>Generate Gap Analysis Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table list - Left */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-850 font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-semibold">Competitor / Channel</th>
                    <th className="p-4 font-semibold text-center">Price index</th>
                    <th className="p-4 font-semibold">Trafic metrics</th>
                    <th className="p-4 font-semibold">Alert incidents</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {competitors.map((com) => {
                    const hasAlert = com.alert !== null;
                    return (
                      <tr 
                        key={com.id} 
                        className={`hover:bg-white dark:bg-zinc-950 transition-colors ${
                          hasAlert ? "bg-amber-950/5" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-bold text-zinc-800 dark:text-zinc-200">{com.name}</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5 flex items-center gap-1.5 break-all">
                            <Globe className="h-3 w-3 inline text-zinc-650" />
                            <span className="truncate max-w-[200px]">{com.url}</span>
                            {com.asin !== "N/A" && <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded font-mono text-zinc-600 dark:text-zinc-400 text-[9px]">{com.asin}</span>}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-[11px] font-mono font-bold ${
                            com.priceIndex < 1.0 
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" 
                              : com.priceIndex > 1.0 
                              ? "bg-amber-950 text-amber-400 border border-amber-900/40"
                              : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-900"
                          }`}>
                            {(com.priceIndex * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-400 font-medium font-sans">{com.estimatedTraffic}</td>
                        <td className="p-4">
                          {hasAlert ? (
                            <div className="flex gap-1.5 text-[10.5px] text-amber-450 leading-relaxed max-w-xs font-medium">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{com.alert}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-650 italic font-mono text-[10px]">No active threat logs</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => onQueryConcierge(`Generate optimized competitor comparison copy for ${com.name} (${com.url}) emphasizing our edge.`)}
                              className="p-1.5 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white rounded-md cursor-pointer transition-colors"
                              title="Compare catalog copy"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(com.id)}
                              className="p-1.5 hover:bg-rose-950 text-zinc-500 dark:text-zinc-400 hover:text-rose-450 rounded-md cursor-pointer transition-colors"
                              title="Remove competitor"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add competitor form - Right */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-5 rounded-xl space-y-4">
          <h2 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <PlusCircle className="h-4 text-indigo-400" />
            <span>Register Storefront</span>
          </h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Register competitor URL domains or Amazon ASIN codes to automatically initiate background metadata keyword scraping.
          </p>

          <form onSubmit={handleAddCompetitor} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-zinc-500 dark:text-zinc-400 font-bold block">Competitor Label</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. FloraSkincare Pro"
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-zinc-500 dark:text-zinc-400 font-bold block">Domain URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://floraskincare.com"
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-zinc-500 dark:text-zinc-400 font-bold block">Amazon ASIN code (Optional)</label>
              <input
                type="text"
                value={newAsin}
                onChange={(e) => setNewAsin(e.target.value)}
                placeholder="B0912X93S2"
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-650 hover:bg-indigo-600 border border-indigo-400 text-zinc-900 dark:text-white font-mono text-xs font-bold py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              Add Tracked Competitor
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

