'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Sparkles, Bot, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function AIChatbot() {
  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Don't render on public pages
  if (!isAuthenticated) return null;

  const loadHistory = async () => {
    if (historyLoaded) return;
    try {
      const history = await api.getAIChatHistory();
      if (Array.isArray(history)) setMessages(history);
      setHistoryLoaded(true);
    } catch { /* ignore */ }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');

    // Optimistic user message
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();
    setLoading(true);

    try {
      const res = await api.sendAIChatMessage(msg);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      scrollToBottom();
    } catch {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await api.clearAIChatHistory();
      setMessages([]);
    } catch { /* ignore */ }
  };

  const handleOpen = () => {
    setIsOpen(true);
    loadHistory();
    scrollToBottom();
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/- /g, '• ');
  };

  return (
    <>
      {/* ─── Floating Button ─── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          style={{
            position: 'fixed',
            bottom: 84,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,113,227,0.3)',
            zIndex: 999,
            transition: 'all 0.3s',
          }}
          className="hover:scale-110"
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 380,
            maxWidth: 'calc(100vw - 40px)',
            height: 520,
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>LocalLoop AI</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>Your relocation assistant</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleClear}
                title="Clear chat"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 6,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                }}
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 6,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.length === 0 && !loading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-muted)',
                }}
              >
                <Sparkles
                  size={32}
                  style={{ margin: '0 auto 12px', color: 'var(--primary)', display: 'block' }}
                />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Hi {user?.name?.split(' ')[0] || 'there'}! 👋
                </p>
                <p style={{ fontSize: 12, lineHeight: 1.5 }}>
                  I can help you find housing, check area prices, or answer questions about relocating. Try:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                  {[
                    'Find me a PG under ₹8000',
                    "What's the average rent in Kothrud?",
                    'Which areas are safest for women?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                      }}
                      style={{
                        background: 'rgba(0,113,227,0.06)',
                        border: '1px solid rgba(0,113,227,0.1)',
                        borderRadius: 10,
                        padding: '8px 14px',
                        fontSize: 12,
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 8,
                }}
              >
                {m.role === 'assistant' && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      alignSelf: 'flex-end',
                    }}
                  >
                    <Bot size={14} color="#fff" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background:
                      m.role === 'user'
                        ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                        : 'rgba(0,0,0,0.04)',
                    color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: formatContent(m.content) }}
                />
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Bot size={14} color="#fff" />
                </div>
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(0,0,0,0.04)',
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                  <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animationDelay: '0.2s' }} />
                  <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              background: 'rgba(255,255,255,0.6)',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about relocating..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(0,0,0,0.02)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: 'none',
                background:
                  input.trim() && !loading
                    ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                    : 'rgba(0,0,0,0.06)',
                color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
