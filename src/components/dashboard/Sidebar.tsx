"use client";

import React from "react";
import {
  Sparkles,
  Activity,
  Radar,
  ShieldCheck,
  Compass,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type PanelId = "chat" | "health" | "competitor" | "compliance" | "explain" | "router" | "settings";

interface SidebarProps {
  activePanel: PanelId;
  onChangePanel: (panel: PanelId) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  activePanel,
  onChangePanel,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {

  const navItems = [
    { id: "chat" as const, name: "Concierge Chat", icon: Sparkles },
    { id: "health" as const, name: "Store Health", icon: Activity },
    { id: "competitor" as const, name: "Competitor Radar", icon: Radar },
    { id: "compliance" as const, name: "Compliance Guardian", icon: ShieldCheck },
    { id: "explain" as const, name: "Explainable AI", icon: Compass },
    { id: "router" as const, name: "Model Router Status", icon: Cpu },
    { id: "settings" as const, name: "Settings", icon: Settings },
  ];

  return (
    <div
      id="sidebar-container"
      className={`flex flex-col transition-all duration-200 h-full border-r ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Sidebar Header Brand Area */}
      <div 
        className="flex items-center justify-between shrink-0 h-14 px-3 border-b"
        style={{ borderColor: "var(--border-color)" }}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div 
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--primary)", color: "#fff" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 
                className="text-xs font-bold font-heading tracking-wide uppercase truncate"
                style={{ color: "var(--text-primary)" }}
              >
                ClarityCommerce
              </h1>
              <span 
                className="text-[9px] font-sans truncate block"
                style={{ color: "var(--text-secondary)" }}
              >
                built by nitishkumar.pro
              </span>
            </div>
          </div>
        ) : (
          <div 
            className="mx-auto h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)", color: "#fff" }}
          >
            <Sparkles className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg shrink-0 hidden md:block transition-colors hover:bg-[var(--bg-surface)]"
          style={{ color: "var(--text-secondary)" }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              id={`nav-btn-${item.id}`}
              key={item.id}
              onClick={() => onChangePanel(item.id)}
              className={`w-full flex items-center px-2.5 py-2.5 rounded-button text-xs font-medium transition-all duration-200 group cursor-pointer text-left ${
                isActive ? "chip-active" : "hover:bg-[var(--bg-surface)]"
              }`}
              title={item.name}
            >
              <IconComponent 
                className={`h-5 w-5 shrink-0 ${
                  isCollapsed ? "mx-auto" : "mr-3"
                } ${isActive ? "text-[var(--primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"}`} 
              />

              {!isCollapsed && (
                <span 
                  className="truncate leading-normal"
                  style={{ color: isActive ? "var(--primary)" : "var(--text-secondary)" }}
                >
                  {item.name}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div 
        className="px-3 py-3 border-t text-center shrink-0"
        style={{ borderColor: "var(--border-color)" }}
      >
        {!isCollapsed ? (
          <div className="text-[9px] font-mono leading-tight" style={{ color: "var(--text-secondary)" }}>
            ClarityCommerce v1.2
            <div className="mt-0.5" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
              Engine: Proprietary
            </div>
          </div>
        ) : (
          <span className="text-[9px] font-mono" style={{ color: "var(--text-secondary)" }}>v1.2</span>
        )}
      </div>
    </div>
  );
}

