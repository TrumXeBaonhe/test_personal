"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  BrainCircuit,
  User,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_SUGGESTIONS = [
  "💰 Số dư ví hiện tại?",
  "📊 Tháng này tôi chi bao nhiêu?",
  "🎯 Ngân sách nào sắp vượt hạn?",
  "💡 Gợi ý tiết kiệm cho tôi",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi là **FinBot** 🤖✨\nTôi biết tình hình tài chính thực của bạn và sẵn sàng giúp đỡ.\nBạn muốn hỏi gì nào?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      const userMessage: Message = { role: "user", content };
      const nextMessages = [...messages, userMessage];

      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply ?? "Có lỗi xảy ra." },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ Không thể kết nối, thử lại sau nhé!",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Xin chào! Tôi là **FinBot** 🤖✨\nTôi biết tình hình tài chính thực của bạn và sẵn sàng giúp đỡ.\nBạn muốn hỏi gì nào?",
      },
    ]);
  };

  // Format markdown-like bold text
  const formatContent = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < part.split("\n").length - 1 && <br />}
        </span>
      ));
    });
  };

  const showSuggestions =
    messages.length === 1 && messages[0].role === "assistant";

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] flex flex-col"
            style={{ height: "520px" }}
          >
            {/* Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-500/40 via-primary/30 to-cyan-500/30 rounded-3xl blur-md opacity-60" />

            <div className="relative flex flex-col h-full rounded-3xl overflow-hidden border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 via-primary to-cyan-600 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">FinBot AI</p>
                    <p className="text-[10px] text-white/70 font-medium">
                      Trợ lý tài chính cá nhân
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={resetChat}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    title="Cuộc hội thoại mới"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 h-7 w-7 rounded-xl flex items-center justify-center shadow-sm ${
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-violet-500 to-primary"
                          : "bg-gradient-to-br from-slate-600 to-slate-700"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-primary to-violet-600 text-white rounded-tr-sm"
                          : "bg-muted/80 text-foreground border border-border/30 rounded-tl-sm"
                      }`}
                    >
                      {formatContent(msg.content)}
                    </div>
                  </motion.div>
                ))}

                {/* Quick suggestions */}
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-2 pt-1"
                  >
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-1">
                      Gợi ý nhanh
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full transition-all hover:scale-105 font-medium"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Typing indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 items-center"
                  >
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-violet-500 to-primary flex items-center justify-center shadow-sm shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="bg-muted/80 border border-border/30 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                      <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 pb-3 pt-2 shrink-0 border-t border-border/20">
                <div className="flex gap-2 items-center bg-muted/50 rounded-2xl border border-border/30 px-3 py-2 focus-within:border-primary/40 focus-within:bg-background transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi về tài chính của bạn..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="p-2 bg-gradient-to-br from-primary to-violet-600 text-white rounded-xl disabled:opacity-40 hover:opacity-90 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-center text-[9px] text-muted-foreground/50 mt-1.5 font-medium">
                  Powered by Groq · Llama 3.3 70B
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        id="ai-chat-trigger"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-[5.5rem] right-6 z-50 h-13 w-13 rounded-2xl shadow-xl shadow-violet-500/30 flex items-center justify-center focus:outline-none"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #4f46e5, #0891b2)",
          height: "52px",
          width: "52px",
        }}
        aria-label="Mở chat với FinBot AI"
      >
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inline-flex h-full w-full rounded-2xl bg-violet-400 opacity-30 animate-ping" />
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-5 w-5 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
