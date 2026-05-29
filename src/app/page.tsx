"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import Sidebar, { PanelId } from "@/components/dashboard/Sidebar";
import ChatPanel from "@/components/dashboard/ChatPanel";
import HealthPanel from "@/components/dashboard/HealthPanel";
import CompetitorPanel from "@/components/dashboard/CompetitorPanel";
import CompliancePanel from "@/components/dashboard/CompliancePanel";
import ExplainabilityPanel from "@/components/dashboard/ExplainabilityPanel";
import RouterStatusPanel from "@/components/dashboard/RouterStatusPanel";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import { Sparkles, Menu, X, Sun, Moon } from "lucide-react";

export default function AppDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<PanelId>("chat");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [tenantId, setTenantId] = useState("merchant-beta-tenant-42");
  const [triggerChatPrompt, setTriggerChatPrompt] = useState<string>("");

  const handleQueryConcierge = (prompt: string) => {
    setTriggerChatPrompt(prompt);
    setActivePanel("chat");
    setIsMobileSidebarOpen(false);
  };

  const handleClearTrigger = () => setTriggerChatPrompt("");

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex overflow-hidden font-sans h-screen">
      {/* Mobile Header */}
      <header className="md:hidden h-[60px] border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 w-full fixed top-0 left-0 flex items-center justify-between px-4 z-50">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 bg-indigo-650 rounded-md flex items-center justify-center text-white border border-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold font-mono tracking-wide text-zinc-900 dark:text-white uppercase">
            ClarityCommerce
          </span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-0 top-[60px] z-40 md:relative md:top-0 md:z-0 transition-transform duration-300 transform md:transform-none shrink-0 h-[calc(100vh-60px)] md:h-full ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <Sidebar
          activePanel={activePanel}
          onChangePanel={(p) => {
            setActivePanel(p);
            setIsMobileSidebarOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden top-[60px]"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pt-[60px] md:pt-0 overflow-hidden h-full">
        {/* Desktop Header */}
        <div className="hidden md:flex h-[72px] border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 shrink-0 items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10.5px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
              Interactive control room
            </span>
            <span className="text-zinc-400 dark:text-zinc-700">•</span>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">
              Tenant: {tenantId}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-md flex items-center space-x-1.5 font-medium text-[10.5px] text-zinc-600 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>30 active skills synced</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a
              href="https://claritycommerce.cc"
              className="text-indigo-500 hover:text-indigo-400 font-bold"
              target="_blank"
              rel="noopener noreferrer"
            >
              claritycommerce.cc
            </a>
          </div>
        </div>

        {/* Active panel */}
        <div className="flex-1 overflow-hidden relative bg-white dark:bg-zinc-950">
          {activePanel === "chat" && (
            <ChatPanel
              tenantId={tenantId}
              setTenantId={setTenantId}
              triggerChatFromOutside={triggerChatPrompt}
              onClearTrigger={handleClearTrigger}
            />
          )}
          {activePanel === "health" && <HealthPanel onQueryConcierge={handleQueryConcierge} />}
          {activePanel === "competitor" && <CompetitorPanel onQueryConcierge={handleQueryConcierge} />}
          {activePanel === "compliance" && <CompliancePanel onQueryConcierge={handleQueryConcierge} />}
          {activePanel === "explain" && <ExplainabilityPanel onQueryConcierge={handleQueryConcierge} />}
          {activePanel === "router" && <RouterStatusPanel onQueryConcierge={handleQueryConcierge} />}
          {activePanel === "settings" && (
            <SettingsPanel
              tenantId={tenantId}
              setTenantId={setTenantId}
              onQueryConcierge={handleQueryConcierge}
            />
          )}
        </div>
      </div>
    </div>
  );
}