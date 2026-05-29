"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Sparkles, Activity, Radar, ShieldCheck, Compass, Cpu, Settings, MessageSquare } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (panel: string) => void;
  onQueryConcierge: (prompt: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onQueryConcierge,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: "chat",
      label: "Open Concierge Chat",
      icon: <MessageSquare className="h-4 w-4" />,
      shortcut: "Chat",
      action: () => onNavigate("chat"),
    },
    {
      id: "health",
      label: "View Store Health",
      icon: <Activity className="h-4 w-4" />,
      shortcut: "Health",
      action: () => onNavigate("health"),
    },
    {
      id: "competitor",
      label: "Competitor Analysis",
      icon: <Radar className="h-4 w-4" />,
      shortcut: "Radar",
      action: () => onNavigate("competitor"),
    },
    {
      id: "compliance",
      label: "Compliance Check",
      icon: <ShieldCheck className="h-4 w-4" />,
      shortcut: "Guard",
      action: () => onNavigate("compliance"),
    },
    {
      id: "explain",
      label: "AI Explainability",
      icon: <Compass className="h-4 w-4" />,
      shortcut: "AI",
      action: () => onNavigate("explain"),
    },
    {
      id: "router",
      label: "Model Router Status",
      icon: <Cpu className="h-4 w-4" />,
      shortcut: "Router",
      action: () => onNavigate("router"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      shortcut: "Config",
      action: () => onNavigate("settings"),
    },
    {
      id: "cmd-health",
      label: "Run AI Health Check",
      icon: <Sparkles className="h-4 w-4" />,
      action: () => {
        onQueryConcierge("Run a baseline store intelligence health diagnostics check across all multi-platform Shopify and Amazon channels.");
        onClose();
      },
    },
    {
      id: "cmd-competitor",
      label: "Analyze Competitors",
      icon: <Sparkles className="h-4 w-4" />,
      action: () => {
        onQueryConcierge("Analyze the top 3 competitors in face skincare market segment and map competitive pricing indexes.");
        onClose();
      },
    },
    {
      id: "cmd-compliance",
      label: "Compliance Review",
      icon: <Sparkles className="h-4 w-4" />,
      action: () => {
        onQueryConcierge("Check all active storefront listing text for FTC and FDA marketing policy compliance.");
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop with glassmorphism */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Command Palette Container */}
      <div className="relative w-full max-w-lg mx-4 card shadow-card animate-slide-in overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
          <Search className="h-5 w-5 text-[var(--text-secondary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-surface)] rounded transition-colors"
          >
            <X className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No commands found</p>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  if (!cmd.shortcut) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                  index === selectedIndex
                    ? "bg-[var(--primary)]/10 border-l-[3px] border-[var(--primary)]"
                    : "hover:bg-[var(--bg-surface)] border-l-[3px] border-transparent"
                }`}
              >
                <span className={`shrink-0 ${index === selectedIndex ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}>
                  {cmd.icon}
                </span>
                <span className={`flex-1 text-sm ${index === selectedIndex ? "text-[var(--primary)] font-medium" : "text-[var(--text-primary)]"}`}>
                  {cmd.label}
                </span>
                {cmd.shortcut && (
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-chip">
                    {cmd.shortcut}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-4 text-[10px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-[9px]">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-[9px]">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-[9px]">esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">
            ClarityCommerce v1.2
          </span>
        </div>
      </div>
    </div>
  );
}
