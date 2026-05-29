"use client";

import React, { useState } from "react";
import {
  Settings,
  Key,
  Trash2,
  ShieldCheck,
  Store,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface SettingsPanelProps {
  tenantId: string;
  setTenantId: (val: string) => void;
  onQueryConcierge: (prompt: string) => void;
}

export default function SettingsPanel({
  tenantId,
  setTenantId,
  onQueryConcierge,
}: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const [targetTenant, setTargetTenant] = useState(tenantId);
  const [isFlushing, setIsFlushing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTenant.trim()) return;
    setTenantId(targetTenant.trim());
    setSuccessMsg(`Tenant context changed to: "${targetTenant.trim()}"`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleClearHistory = () => {
    setIsFlushing(true);
    setTimeout(() => {
      setIsFlushing(false);
      setSuccessMsg("Chat history cleared for this tenant.");
      setTimeout(() => setSuccessMsg(null), 3500);
    }, 1200);
  };

  const platformStatus = [
    { name: "Shopify", connected: true, lastSync: "2 min ago" },
    { name: "Amazon Seller Central", connected: true, lastSync: "12 min ago" },
    { name: "eBay", connected: true, lastSync: "4 min ago" },
    { name: "Etsy", connected: false, lastSync: "Not connected" },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-lg font-bold font-mono tracking-wider text-zinc-900 dark:text-white uppercase flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-500" />
          Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your store identity and platform connections.
        </p>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Tenant identity */}
        <div className="md:col-span-5 card-glow p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Key className="h-4 text-indigo-500" />
              Tenant Identity
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4">
              This handle identifies your store in the routing engine.
            </p>
            <form onSubmit={handleUpdateTenant} className="space-y-2.5">
              <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">
                Active Tenant Handle
              </label>
              <input
                type="text"
                required
                value={targetTenant}
                onChange={(e) => setTargetTenant(e.target.value)}
                placeholder="my-store-handle"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-indigo-500 outline-none"
              />
              <button
                type="submit"
                className="w-full btn-primary"
              >
                Update Tenant ID
              </button>
            </form>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 mt-5">
            <h3 className="text-[11px] font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-3">
              Data Management
            </h3>
            <button
              onClick={handleClearHistory}
              disabled={isFlushing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-mono font-bold border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isFlushing ? "Clearing..." : "Clear Chat History"}
            </button>
          </div>
        </div>

        {/* Platform connections & privacy */}
        <div className="md:col-span-7 space-y-6">
          {/* Platforms */}
          <div className="card-glow p-5">
            <h2 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Store className="h-4 w-4" />
              Platform Connections
            </h2>
            <div className="space-y-3">
              {platformStatus.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {platform.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {platform.lastSync}
                    </p>
                  </div>
                  <div>
                    {platform.connected ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Connected
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          onQueryConcierge(
                            `Connect my ${platform.name} store to ClarityCommerce.`
                          )
                        }
                        className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 mt-3 flex items-center gap-1">
              <Info className="h-3 w-3" />
              All connections are managed securely — you never need to enter
              API keys.
            </p>
          </div>

          {/* Theme & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-glow p-5">
              <h3 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Appearance
              </h3>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors w-full justify-center"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>

            <div className="card-glow p-5">
              <h3 className="text-xs font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4" />
                Privacy
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">
                Your data is encrypted and never shared. All AI processing
                happens on ClarityCommerce’s proprietary engine.
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Built by nitishkumar.pro
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}