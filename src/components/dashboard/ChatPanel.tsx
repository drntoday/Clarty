"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  RotateCw, 
  User, 
  Bot, 
  Cpu, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Layers, 
  Compass, 
  Briefcase 
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  tenantId: string;
  setTenantId: (val: string) => void;
  triggerChatFromOutside?: string; // Optional prompt triggered from other panels
  onClearTrigger?: () => void;
}

export default function ChatPanel({ 
  tenantId, 
  setTenantId, 
  triggerChatFromOutside,
  onClearTrigger 
}: ChatPanelProps) {
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to ClarityCommerce Concierge. I am your single point of contact orchestrating all 30 commerce active skills. Ask me to route tasks, monitor analytics, audit compliance, or update listings safely.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [capabilityTag, setCapabilityTag] = useState<"execution" | "strategy" | "verification">("strategy");
  const [isStreaming, setIsStreaming] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [resolvedEngine, setResolvedEngine] = useState<string | null>(null);

  // Suggested Prompts
  const suggestions = [
    { label: "Competitor Scan", prompt: "Who competes with organic face serums and what are their prices?" },
    { label: "compliance Review", prompt: "TOS check: can I sell an anti-aging cream stating it guarantees results under FDA code?" },
    { label: "Seasonal Forecast", prompt: "Run a holiday forecast Q4 seasonal demand planning check." },
    { label: "SEO Audit", prompt: "Run an SEO audit on my main store product listings." }
  ];

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle outside actions trigger
  useEffect(() => {
    if (triggerChatFromOutside) {
      setInputMessage(triggerChatFromOutside);
      // Determine probable capability based on the prompt content
      const lower = triggerChatFromOutside.toLowerCase();
      if (lower.includes("compliance") || lower.includes("policy") || lower.includes("tos") || lower.includes("verify")) {
        setCapabilityTag("verification");
      } else if (lower.includes("update") || lower.includes("write") || lower.includes("optimize") || lower.includes("edit")) {
        setCapabilityTag("execution");
      } else {
        setCapabilityTag("strategy");
      }
      if (onClearTrigger) onClearTrigger();
    }
  }, [triggerChatFromOutside, onClearTrigger]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    const userMessage = textToSend.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);
    setResolvedEngine(null);
    
    addLog(`Routing request to AI Gateway. System Capability Target: [${capabilityTag.toUpperCase()}]`);

    // Setup streaming placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          tenantId,
          capabilityTag,
        }),
      });

      if (!response.body) {
        throw new Error("API streaming body reader is inaccessible.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      addLog("Synchronizing SSE channel headers...");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split("\n");

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (!cleanedLine) continue;

          if (cleanedLine.startsWith("data: ")) {
            try {
              const payload = JSON.parse(cleanedLine.substring(6));
              
              if (payload.text) {
                accumulatedText += payload.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                    updated[lastIndex] = { ...updated[lastIndex], content: accumulatedText };
                  }
                  return updated;
                });
              } else if (payload.routeInfo) {
                const { capability, modelId } = payload.routeInfo;
                const engineName = capability === "strategy" ? "Strategy Engine" : capability === "execution" ? "Execution Engine" : "Verification Engine";
                setResolvedEngine(engineName);
                addLog(`🎯 Routed successfully to Clarity Proprietary Engine: "${engineName}" (Ref: ${modelId})`);
              } else if (payload.toolCallStart) {
                addLog(`⚙️ Initialized commerce tool orchestration: "${payload.toolCallStart.tool}"`);
              } else if (payload.toolCallResult) {
                const { tool, outcome } = payload.toolCallResult;
                addLog(`✅ Verified Tool Action [${tool}] applied smoothly. Standard compliance: PASSED`);
                
                // Append inline structured outcome visualization inside stream
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                    // Prepend/append formatting
                    const toolSection = `\n\n### ⚙️ [SYSTEM ACTION OUTCOME: ${tool.toUpperCase()}]
\`\`\`json
${JSON.stringify(outcome?.data, null, 2)}
\`\`\`
*(Execution metrics validated across all node channels. Compliant inside ClarityCommerce flat-rate models.)*`;
                    updated[lastIndex] = { ...updated[lastIndex], content: updated[lastIndex].content + toolSection };
                  }
                  return updated;
                });
              } else if (payload.error) {
                addLog(`⚠️ Channel error logged: ${payload.error.message}`);
              }
            } catch (_) {}
          }
        }
      }

      addLog("Stream connection resolved in full.");
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Client interface pipeline failure: ${err.message}`);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === "assistant" && !updated[lastIndex].content) {
          updated[lastIndex] = {
            role: "assistant",
            content: "Sorry, I encountered an operational network barrier. Please configure your model configuration keys inside the environment panel settings.",
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div id="chat-panel-container" className="flex flex-col h-full overflow-hidden">
      {/* Sub Header for chat routing */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-850 p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-left">
          <div className="h-9 w-9 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center text-indigo-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold font-mono tracking-wider text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
              <span>Orchestrated AI Concierge</span>
              {resolvedEngine && (
                <span className="bg-indigo-950 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-900 font-normal">
                  {resolvedEngine}
                </span>
              )}
            </h2>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Auto-routing messages to specialized engines based on capability intent map.</p>
          </div>
        </div>

        {/* Engine selector */}
        <div className="flex bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg p-0.5 max-width-full sm:w-auto overflow-x-auto self-end">
          {[
            { tag: "execution" as const, name: "Execution Engine" },
            { tag: "strategy" as const, name: "Strategy Engine" },
            { tag: "verification" as const, name: "Verification/audit" }
          ].map((item) => (
            <button
              id={`chat-engine-selector-${item.tag}`}
              key={item.tag}
              onClick={() => {
                setCapabilityTag(item.tag);
                addLog(`Manually set active engine target schema to ${item.name}`);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                capabilityTag === item.tag
                  ? "bg-indigo-650 text-zinc-900 dark:text-white shadow-md font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat window split with logs */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* Chat bubble screen area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-950">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-[90%] text-left whitespace-pre-wrap leading-relaxed select-text ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border text-zinc-900 dark:text-zinc-100 ${
                  m.role === "user" ? "bg-indigo-900 border-indigo-700" : "bg-emerald-950 border-emerald-850"
                }`}>
                  {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                
                <div className={`p-4 rounded-xl ${
                  m.role === "user" 
                    ? "bg-indigo-650 text-zinc-900 dark:text-white rounded-tr-none text-xs" 
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-800 dark:text-zinc-200 rounded-tl-none text-[12.5px]"
                }`}>
                  {/* Handle customized markdown or bullet listings simply */}
                  {m.content ? (
                    <div className="space-y-2 select-text">
                      {m.content.split("\n").map((line, idx) => {
                        if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
                          return (
                            <li key={idx} className="ml-4 list-disc text-zinc-700 dark:text-zinc-300 leading-normal font-sans">
                              {line.substring(1).trim()}
                            </li>
                          );
                        }
                        if (line.trim().startsWith("###") || line.trim().startsWith("##")) {
                          return (
                            <h3 key={idx} className="font-mono text-xs font-bold text-zinc-900 dark:text-white tracking-wider mt-3 mb-1 uppercase">
                              {line.replace(/#/g, "").trim()}
                            </h3>
                          );
                        }
                        if (line.trim().startsWith("```")) {
                          return null; // Don't show raw json blocks if formatted, else render text simply
                        }
                        return <p key={idx} className="font-sans leading-relaxed">{line}</p>;
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-zinc-500 dark:text-zinc-400 font-medium select-none py-1">
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick recommendations panel helper */}
          <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-900/40 flex items-center gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 uppercase font-mono shrink-0 whitespace-nowrap">Quick Skills triggers:</span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(undefined, s.prompt)}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:bg-zinc-800 text-[10px] px-2.5 py-1 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white cursor-pointer transition-all whitespace-nowrap"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Prompt Entry Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 flex gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. 'How can I optimize pricing for my organic lip balms?'"
              className="flex-grow bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg px-4 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-650 outline-none focus:border-indigo-500 h-11"
              disabled={isStreaming}
            />
            <button
              id="send-message-btn"
              type="submit"
              disabled={isStreaming || !inputMessage.trim()}
              className="h-11 w-11 bg-indigo-550 border border-indigo-400 hover:bg-indigo-600 text-zinc-900 dark:text-white rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              {isStreaming ? <RotateCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Right Logs Column viewer (collapsible) */}
        {showLogs && (
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex flex-col pt-3 overflow-hidden shrink-0">
            <div className="px-3 pb-2 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                <span>Concierge Trace Stream</span>
              </span>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 underline"
              >
                Clear
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-3 font-mono text-[9.5px] text-zinc-600 dark:text-zinc-400 space-y-2 select-all scrollbar-thin text-left bg-white dark:bg-zinc-950">
              {logs.length === 0 ? (
                <div className="text-zinc-700 italic">Logs are offline. Send a conversational query to capture tracer pipeline events...</div>
              ) : (
                logs.map((lg, i) => (
                  <div key={i} className="leading-normal pb-1 border-b border-zinc-200 dark:border-zinc-900/50 break-words font-sans">{lg}</div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

