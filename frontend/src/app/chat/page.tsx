'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send, Mic, Smile, Video, Phone, MoreVertical,
  FileText, Download, MessageCircle, ArrowLeft, Circle,
  Image as ImageIcon, Paperclip, Check, CheckCheck,
} from 'lucide-react';

/* ── Demo Data ──────────────────────────────────────────── */

const conversations = [
  {
    id: '1', name: 'David Chen', mentor: true,
    msg: 'Looking forward to our coffee ch...', time: '12:45 PM', unread: 2,
    online: true, initials: 'DC',
    avatarGrad: 'linear-gradient(135deg, #818cf8, #6366f1)',
  },
  {
    id: '2', name: 'Berlin Tech Nomads', group: true,
    msg: 'Sarah: Does anyone know a good coworki...', time: '8:12 AM', unread: 0,
    initials: 'BT',
    avatarGrad: 'linear-gradient(135deg, #6ee7b7, #10b981)',
  },
  {
    id: '3', name: 'Elena Rodriguez',
    msg: 'That rental contract looks solid. Go for it!', time: 'YESTERDAY', unread: 0,
    initials: 'ER',
    avatarGrad: 'linear-gradient(135deg, #fca5a5, #f87171)',
  },
  {
    id: '4', name: 'Skyview Residency', pg: true,
    msg: 'Payment received for September. Welcome!', time: 'AUG 14', unread: 0,
    initials: 'SR',
    avatarGrad: 'linear-gradient(135deg, #93c5fd, #60a5fa)',
  },
  {
    id: '5', name: 'Priya Kapoor', mentor: false,
    msg: 'Found a great gym near Wakad!', time: 'AUG 10', unread: 0,
    initials: 'PK',
    avatarGrad: 'linear-gradient(135deg, #fde68a, #fbbf24)',
  },
];

const chatMessages = [
  {
    id: 1,
    text: 'Hi Alex! I reviewed the apartment options you sent over for Lisbon. The one in Arroios looks great for digital nomads—lots of cafes and fast internet.',
    mine: false, time: '12:42 PM',
  },
  {
    id: 2,
    text: "That's what I was thinking! Is the commute to the tech hub area manageable from there?",
    mine: true, time: '12:44 PM', read: true,
  },
  {
    id: 3,
    text: "Absolutely. It's just 3 stops on the green line. Looking forward to our coffee chat about Lisbon housing! ☕",
    mine: false, time: '12:45 PM',
  },
];

/* ── Chat Page ─────────────────────────────────────────── */

export default function ChatPage() {
  const [selected, setSelected] = useState<string | null>('1');
  const [messages, setMessages] = useState(chatMessages);
  const [newMsg, setNewMsg] = useState('');
  const [tab, setTab] = useState('All');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const conv = conversations.find((c) => c.id === selected);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages((p) => [
      ...p,
      {
        id: Date.now(),
        text: newMsg,
        mine: true,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
    ]);
    setNewMsg('');

    // Simulate typing indicator
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((p) => [
        ...p,
        {
          id: Date.now() + 1,
          text: 'Thanks for sharing! I\'ll look into that. 😊',
          mine: false,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 2500);
  };

  const tabs = ['All', 'Mentors', 'Groups', 'PGs'];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>

      {/* ══════════ CONVERSATIONS LIST ══════════ */}
      <div className={`${selected ? 'hidden md:flex' : 'flex'}`} style={{
        width: 360, flexShrink: 0, flexDirection: 'column',
        borderRight: '1px solid #e5e7ee', background: '#fff',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 22px 18px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 18 }}>Messages</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '7px 18px', borderRadius: 22, fontSize: 13, fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                background: tab === t ? '#6366f1' : 'transparent',
                color: tab === t ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((c) => {
            const isActive = selected === c.id;
            return (
              <button key={c.id} onClick={() => setSelected(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                background: isActive ? 'rgba(99,102,241,0.06)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.12s',
              }}>
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                    background: c.pg ? 'rgba(99,102,241,0.1)' : c.avatarGrad,
                    color: c.pg ? '#6366f1' : '#fff',
                  }}>{c.initials}</div>
                  {c.online && (
                    <div style={{
                      position: 'absolute', bottom: 1, right: 1, width: 13, height: 13,
                      borderRadius: '50%', background: '#10b981', border: '2.5px solid #fff',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{c.name}</span>
                    {c.mentor && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: '#6366f1',
                        background: 'rgba(99,102,241,0.1)', padding: '2px 7px',
                        borderRadius: 5, textTransform: 'uppercase' as const, letterSpacing: '0.02em',
                      }}>MENTOR</span>
                    )}
                    {c.group && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: '#10b981',
                        background: 'rgba(16,185,129,0.1)', padding: '2px 7px',
                        borderRadius: 5, textTransform: 'uppercase' as const, letterSpacing: '0.02em',
                      }}>GROUP</span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 12, color: '#94a3b8', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, margin: 0,
                  }}>{c.msg}</p>
                </div>

                {/* Time + Badge */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                  gap: 6, flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8' }}>{c.time}</span>
                  {c.unread > 0 && (
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, background: '#6366f1', color: '#fff',
                    }}>{c.unread}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════ CHAT AREA ══════════ */}
      <div className={`${!selected ? 'hidden md:flex' : 'flex'}`} style={{
        flex: 1, flexDirection: 'column', background: '#f8f9fc',
      }}>
        {conv ? (
          <>
            {/* ── Chat Header ── */}
            <div style={{
              padding: '14px 22px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', background: '#fff',
              borderBottom: '1px solid #e5e7ee',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => setSelected(null)} className="md:hidden" style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
                }}>
                  <ArrowLeft size={20} />
                </button>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                  background: conv.avatarGrad || 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
                  color: '#fff',
                }}>{conv.initials}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>{conv.name}</span>
                    {conv.mentor && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: '#6366f1',
                        background: 'rgba(99,102,241,0.1)', padding: '3px 8px',
                        borderRadius: 5, textTransform: 'uppercase' as const,
                      }}>TOP MENTOR</span>
                    )}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, color: conv.online ? '#10b981' : '#94a3b8',
                  }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: conv.online ? '#10b981' : '#cbd5e1',
                    }} />
                    {conv.online ? 'Active now' : 'Last seen recently'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[Video, Phone, MoreVertical].map((Icon, i) => (
                  <button key={i} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                    padding: 8, borderRadius: 10, transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f1f5'; e.currentTarget.style.color = '#64748b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
                  ><Icon size={20} /></button>
                ))}
              </div>
            </div>

            {/* ── Messages ── */}
            <div style={{
              flex: 1, overflow: 'auto', padding: '20px 24px',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              {/* Date separator */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#94a3b8', background: '#fff',
                  padding: '5px 18px', borderRadius: 24, border: '1px solid #e5e7ee',
                  letterSpacing: '0.04em',
                }}>TODAY</span>
              </div>

              {messages.map((m) => (
                <div key={m.id} style={{
                  display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start',
                  gap: 10, animation: 'fadeIn 0.3s ease',
                }}>
                  {/* Other person's avatar */}
                  {!m.mine && (
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                      background: conv.avatarGrad || 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
                      color: '#fff', alignSelf: 'flex-end', flexShrink: 0,
                    }}>{conv.initials?.charAt(0)}</div>
                  )}
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{
                      padding: '14px 18px', fontSize: 14, lineHeight: 1.55,
                      background: m.mine
                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                        : '#fff',
                      color: m.mine ? '#fff' : '#1a1a2e',
                      borderRadius: m.mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      border: m.mine ? 'none' : '1px solid #f0f1f5',
                      boxShadow: m.mine
                        ? '0 2px 8px rgba(99,102,241,0.25)'
                        : '0 1px 3px rgba(0,0,0,0.04)',
                    }}>{m.text}</div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 10, color: '#94a3b8', marginTop: 5,
                      justifyContent: m.mine ? 'flex-end' : 'flex-start',
                    }}>
                      {m.time}
                      {m.mine && m.read && (
                        <CheckCheck size={12} style={{ color: '#6366f1' }} />
                      )}
                      {m.mine && !m.read && (
                        <Check size={12} style={{ color: '#94a3b8' }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* File attachment */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
                  borderRadius: '18px 18px 4px 18px',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.2)',
                  }}><FileText size={20} /></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Lisbon_Nomad_Guide.pdf</div>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>2.4 MB • PDF DOCUMENT</div>
                  </div>
                  <button style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff',
                  }}>
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: 'flex', gap: 10, animation: 'fadeIn 0.3s ease' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                    background: conv.avatarGrad || 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
                    color: '#fff', alignSelf: 'flex-end', flexShrink: 0,
                  }}>{conv.initials?.charAt(0)}</div>
                  <div style={{
                    padding: '14px 20px', background: '#fff', borderRadius: '18px 18px 18px 4px',
                    border: '1px solid #f0f1f5', display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#94a3b8',
                        animation: `typingBounce 1.4s infinite ${i * 0.15}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* ── Input Bar ── */}
            <form onSubmit={send} style={{
              padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', borderTop: '1px solid #e5e7ee',
            }}>
              <button type="button" style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                padding: 4, borderRadius: 8, transition: 'color 0.15s',
              }}><Mic size={20} /></button>
              <button type="button" style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                padding: 4, borderRadius: 8, transition: 'color 0.15s',
              }}><Smile size={20} /></button>
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder={`Write a message to ${conv.name.split(' ')[0]}...`}
                style={{
                  flex: 1, background: '#f8f9fc', border: '1px solid #e5e7ee',
                  borderRadius: 14, padding: '11px 18px', fontSize: 14,
                  outline: 'none', color: '#1a1a2e', fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7ee'}
              />
              <button type="submit" disabled={!newMsg.trim()} style={{
                width: 42, height: 42, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', border: 'none',
                cursor: newMsg.trim() ? 'pointer' : 'default',
                background: newMsg.trim()
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#e5e7ee',
                color: '#fff',
                boxShadow: newMsg.trim() ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                transition: 'all 0.2s',
              }}><Send size={16} /></button>
            </form>
          </>
        ) : (
          /* Empty state */
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: 24, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(99,102,241,0.08)', marginBottom: 18,
            }}>
              <MessageCircle size={40} style={{ color: '#6366f1' }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: 20, color: '#1a1a2e', marginBottom: 4 }}>Select a conversation</p>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>Choose someone to start chatting</p>
          </div>
        )}
      </div>

      {/* ── Typing animation keyframes ── */}
      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
