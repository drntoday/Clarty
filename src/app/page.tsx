"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import Sidebar, { PanelId } from "@/components/dashboard/Sidebar";
import ChatPanel from "@/components/dashboard/ChatPanel";
import HealthPanel from "@/components/dashboard/HealthPanel";
import CompetitorPanel from "@/components/dashboard/CompetitorPanel";
import CompliancePanel from "@/components/dashboard/CompliancePanel";
import ExplainabilityPanel from "@/components/dashboard/ExplainabilityPanel";
import RouterStatusPanel from "@/components/dashboard/RouterStatusPanel";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import CommandPalette from "@/components/dashboard/CommandPalette";
import { Sparkles, Menu, X, Sun, Moon, Keyboard } from "lucide-react";

export default function AppDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activePanel, setActivePanel] = useState<PanelId>("chat");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [tenantId, setTenantId] = useState("merchant-beta-tenant-42");
  const [triggerChatPrompt, setTriggerChatPrompt] = useState<string>("");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleQueryConcierge = (prompt: string) => {
    setTriggerChatPrompt(prompt);
    setActivePanel("chat");
    setIsMobileSidebarOpen(false);
  };

  const handleClearTrigger = () => setTriggerChatPrompt("");

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div 
      className="flex overflow-hidden font-sans h-screen"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Mobile Header */}
      <header 
        className="md:hidden h-14 border-b fixed top-0 left-0 right-0 flex items-center justify-between px-4 z-50"
        style={{ 
          backgroundColor: "var(--bg-primary)", 
          borderColor: "var(--border-color)" 
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="h-7 w-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-bold font-heading tracking-wide uppercase" style={{ color: "var(--text-primary)" }}>
            ClarityCommerce
          </span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-surface)]"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border-color)" }}
        >
          {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-0 top-14 z-40 md:relative md:top-0 md:z-0 transition-transform duration-300 transform md:transform-none shrink-0 h-[calc(100vh-56px)] md:h-full ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden top-14"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full pt-14 md:pt-0">
        {/* Desktop Header */}
        <div 
          className="hidden md:flex h-14 border-b px-6 shrink-0 items-center justify-between z-10"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              Interactive control room
            </span>
            <span style={{ color: "var(--border-color)" }}>•</span>
            <span 
              className="text-[10px] px-2 py-0.5 rounded-chip font-mono"
              style={{ 
                backgroundColor: "var(--bg-surface)", 
                borderColor: "var(--border-color)",
                color: "var(--primary)"
              }}
            >
              Tenant: {tenantId}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div 
              className="px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium text-[10px]"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              <span style={{ color: "var(--text-secondary)" }}>30 active skills synced</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-surface)]"
              style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)" }}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-[var(--bg-surface)]"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}
            >
              <Keyboard className="h-3.5 w-3.5" style={{ color: "var(--text-secondary)" }} />
              <span style={{ color: "var(--text-secondary)" }}>Search…</span>
              <kbd 
                className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
              >
                Ctrl+K
              </kbd>
            </button>
            <a
              href="https://claritycommerce.cc"
              className="font-bold hover:underline"
              style={{ color: "var(--primary)" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              claritycommerce.cc
            </a>
          </div>
        </div>

        {/* Active panel */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: "var(--bg-primary)" }}>
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

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(panel) => {
          setActivePanel(panel as PanelId);
          setIsCommandPaletteOpen(false);
        }}
        onQueryConcierge={handleQueryConcierge}
      />
    </div>
  );
}