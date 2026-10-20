"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Send,
  RefreshCw,
  Copy,
  Check,
  Bot,
  User,
  Trash2,
  ChevronDown
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useResumeStore } from "@/store/useResumeStore";
import {
  getPriorityGaps,
  getNextBestAction,
  calculatePreparationReadiness,
  STORAGE_KEYS
} from "@/lib/hicejoState";
import { getCuratedCurriculumForRole } from "@/data/learningCurricula";

import { FormattedMarkdown } from "@/components/shared/FormattedMarkdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const DEFAULT_SUGGESTIONS = [
  "What should I work on today?",
  "Analyze my highest-impact gap and give me an action plan",
  "How do my target job requirements compare with my current resume evidence?",
  "Review my latest interview debrief and help me prepare for follow-ups",
  "How can I turn my learning into verifiable evidence bullets?"
];

function CareerChatContent() {
  const { careerProfile, activeJobContext, data: resumeData } = useResumeStore();

  // Real count of the user's saved resumes — no assumed baseline.
  const [resumeCountState, setResumeCountState] = React.useState(0);

  React.useEffect(() => {
    fetch("/api/resume")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setResumeCountState(json.data.length);
        }
      })
      .catch(() => {});
  }, []);

  const getHicejoContext = React.useCallback(() => {
    let savedTargets: any[] = [];
    let lastInterviewEval: any = null;
    if (typeof window !== "undefined") {
      try {
        const storedTargets = localStorage.getItem(STORAGE_KEYS.SAVED_TARGETS);
        if (storedTargets) savedTargets = JSON.parse(storedTargets);
        const storedEval = localStorage.getItem(STORAGE_KEYS.LAST_INTERVIEW_EVAL);
        if (storedEval) lastInterviewEval = JSON.parse(storedEval);
      } catch {}
    }

    const targetRole = careerProfile?.targetRole || "Software Engineer";
    const experienceLevel = careerProfile?.experienceLevel || "Mid-Level";
    const curriculum = getCuratedCurriculumForRole(targetRole, experienceLevel);
    const allSkills = curriculum?.modules?.flatMap((m) => m.skills) || [];

    const resumeCount = resumeCountState;
    const priorityGaps = getPriorityGaps(targetRole, savedTargets, allSkills, resumeCount);
    const nextBestAction = getNextBestAction(targetRole, savedTargets, priorityGaps, resumeCount);
    const readiness = calculatePreparationReadiness(
      targetRole,
      experienceLevel,
      allSkills,
      resumeCount,
      null,
      lastInterviewEval?.score || null
    );

    return {
      targetRole,
      experienceLevel,
      readiness,
      priorityGaps,
      nextBestAction,
      lastInterviewEval,
      targetJobCount: savedTargets.length,
      resumeCount,
      activeJob: activeJobContext
        ? { title: activeJobContext.jobTitle, company: activeJobContext.company }
        : undefined
    };
  }, [careerProfile, activeJobContext, resumeCountState]);

  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("hicejo_career_chat_messages");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [
      {
        id: "welcome-1",
        role: "assistant",
        content: `Hello! I am your **Hicejo Career & Strategy Advisor**.\n\nI have full visibility into your active target roles, diagnosed requirement gaps, resume evidence, and recent interview debriefs.\n\nAsk me **"What should I work on today?"** to get your highest-impact action plan, or ask any question on interview preparation, resume evidence, and career progression.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isSampleQuestionsOpen, setIsSampleQuestionsOpen] = React.useState(false);
  const sampleMenuRef = React.useRef<HTMLDivElement | null>(null);

  // Close sample questions popover on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(event.target as Node)) {
        setIsSampleQuestionsOpen(false);
      }
    }
    if (isSampleQuestionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSampleQuestionsOpen]);

  const searchParams = useSearchParams();
  const urlPrompt = searchParams.get("prompt");
  const promptExecutedRef = React.useRef(false);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  // Persist messages in session
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("hicejo_career_chat_messages", JSON.stringify(messages));
      } catch {}
    }
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle incoming practice prompt from learning or other tools
  React.useEffect(() => {
    if (urlPrompt && !promptExecutedRef.current) {
      promptExecutedRef.current = true;
      handleSend(urlPrompt);
    }
  }, [urlPrompt]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const hicejoContext = getHicejoContext();

      const res = await fetch("/api/ai/career-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          careerProfile,
          resumeData,
          hicejoContext
        })
      });

      const json = await res.json();
      const replyContent =
        json.reply ||
        "I analyzed your question. To maximize impact, tailor your evidence specifically to the metrics and architectural patterns expected in this role.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error connecting to the advisor service. Please check your internet connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const initial: ChatMessage[] = [
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Chat history cleared. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
    setMessages(initial);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hicejo_career_chat_messages");
    }
  };

  return (
    <DashboardShell title="Career AI Assistant">
      <div className="max-w-4xl mx-auto space-y-4 pb-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Universal Career & Tool Assistant</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Career AI Advisor
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ask any question on career strategy, interview prep, resume formulation, or how to use Hicejo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="text-xs h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Chat History Container */}
        <Card className="border-border/70 bg-card p-4 sm:p-6 shadow-xs min-h-[460px] flex flex-col justify-between space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[560px] pr-1 text-xs">
            {messages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`space-y-1.5 max-w-[85%] ${isAi ? "items-start" : "items-end flex flex-col"}`}>
                    <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">{isAi ? "Hicejo AI Advisor" : "You"}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl leading-relaxed ${
                        isAi
                          ? "bg-muted/40 border border-border/60 text-foreground text-xs"
                          : "bg-primary text-primary-foreground font-medium shadow-xs text-xs whitespace-pre-wrap"
                      }`}
                    >
                      {isAi ? <FormattedMarkdown content={msg.content} /> : msg.content}
                    </div>

                    {isAi && (
                      <div className="flex items-center gap-2 px-1 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Response</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold text-xs">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Consulting advisor knowledge base...</span>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Input Bar with Compact Sample Questions Option (Consumes Zero Extra Lines) */}
          <div className="pt-2 border-t border-border/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              {/* Sample Questions Option Button */}
              <div className="relative shrink-0" ref={sampleMenuRef}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSampleQuestionsOpen((prev) => !prev)}
                  className={`h-10 px-3 text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                    isSampleQuestionsOpen
                      ? "bg-primary/10 border-primary/40 text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground border-border/70 bg-background hover:bg-muted/40"
                  }`}
                  title="Choose from sample questions"
                >
                  <span className="text-amber-500">💡</span>
                  <span className="hidden sm:inline">Sample Questions</span>
                  <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform ${isSampleQuestionsOpen ? "rotate-180" : ""}`} />
                </Button>

                {/* Floating Sample Questions Popover */}
                {isSampleQuestionsOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card p-2 shadow-2xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150 text-foreground">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="text-amber-500">💡</span>
                        <span>Sample Questions</span>
                      </span>
                      <span className="text-[10px] font-normal text-muted-foreground lowercase">click to ask</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                      {DEFAULT_SUGGESTIONS.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setIsSampleQuestionsOpen(false);
                            handleSend(suggestion);
                          }}
                          disabled={isLoading}
                          className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all cursor-pointer flex items-start gap-2 group"
                        >
                          <span className="text-amber-500 shrink-0 mt-0.5 text-xs">💡</span>
                          <span className="leading-snug flex-1 group-hover:font-semibold">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <textarea
                rows={1}
                placeholder="Ask any question about your resume, interview rounds, career decisions, or Hicejo..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-sans"
              />

              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-10 px-4 font-bold text-xs bg-primary text-primary-foreground gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </Card>

      </div>
    </DashboardShell>
  );
}

export default function CareerChatPage() {
  return (
    <React.Suspense
      fallback={
        <DashboardShell title="Career AI Advisor">
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            <span>Loading Career AI Advisor...</span>
          </div>
        </DashboardShell>
      }
    >
      <CareerChatContent />
    </React.Suspense>
  );
}
