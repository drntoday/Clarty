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
  Menu,
  ChevronLeft,
  ChevronRight
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
  setIsCollapsed
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
      className={`bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-850 flex flex-col transition-all duration-300 h-full ${isCollapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Sidebar Header Brand Area */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between shrink-0 h-[72px]">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-650 rounded-lg flex items-center justify-center text-zinc-900 dark:text-white border border-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xs font-bold font-mono tracking-wider text-zinc-900 dark:text-white uppercase">ClarityCommerce</h1>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-sans tracking-tight block">nitishkumar.pro</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto h-8 w-8 bg-indigo-650 rounded-lg flex items-center justify-center text-zinc-900 dark:text-white border border-indigo-400">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors cursor-pointer hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <nav id="sidebar-nav" className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              id={`nav-btn-${item.id}`}
              key={item.id}
              onClick={() => onChangePanel(item.id)}
              className={`w-full flex items-center p-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer text-left ${isActive
                ? "bg-indigo-650/15 border border-indigo-550/30 text-indigo-450"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 hover:bg-white dark:bg-zinc-900 border border-transparent"
                }`}
              title={item.name}
            >
              <IconComponent className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:text-zinc-200"
                } ${isCollapsed ? "mx-auto" : "mr-3"}`} />

              {!isCollapsed && (
                <span className="truncate leading-normal">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 shrink-0 text-center">
        {!isCollapsed ? (
          <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono tracking-tight leading-normal">
            ClarityCommerce v1.2
            <div className="mt-0.5 text-zinc-650">Engine: Proprietary</div>
          </div>
        ) : (
          <span className="text-[9px] text-zinc-700 font-mono">v1.2</span>
        )}
      </div>
    </div>
  );
}

