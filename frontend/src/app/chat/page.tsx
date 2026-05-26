'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Send, Mic, Smile, Video, Phone, MoreVertical,
  MessageCircle, ArrowLeft, Check, CheckCheck,
  Plus, Search, X,
} from 'lucide-react';

/* ── Inner component that reads searchParams ── */
function ChatInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [tab, setTab] = useState('All');
  const [typingState, setTypingState] = useState(false);

  // New conversation modal
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedRef = useRef<string | null>(null);
  // Map of userId -> name for users we start conversations with
  const pendingNamesRef = useRef<Record<string, string>>({});

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  /* ── Fetch existing conversations ── */
  const fetchConversations = async () => {
    try {
      const convs = await api.getConversations();
      const myCommsObj = await api.getMyCommunities();
      const myComms = Array.isArray(myCommsObj) ? myCommsObj : (myCommsObj?.data || []);

      const grads = [
        'linear-gradient(135deg, #c4b5fd, #a78bfa)',
        'linear-gradient(135deg, #93c5fd, #60a5fa)',
        'linear-gradient(135deg, #fca5a5, #f87171)',
        'linear-gradient(135deg, #fcd34d, var(--warning))',
      ];

      const mappedDirect = convs.map((c: any, i: number) => ({
        id: c.partner.id,
        name: c.partner.name,
        group: false,
        msg: c.lastMessage?.content || 'Start a conversation',
        unread: c.unreadCount || 0,
        initials: c.partner.name?.substring(0, 2).toUpperCase() || 'U',
        avatarGrad: grads[i % grads.length],
        online: false,
      }));

      const mappedGroups = myComms.map((c: any, i: number) => {
        const comm = c.community || c;
        return {
          id: comm.id,
          name: comm.name,
          group: true,
          msg: 'Group chat',
          unread: 0,
          initials: comm.name?.substring(0, 2).toUpperCase() || 'G',
          avatarGrad: 'linear-gradient(135deg, #6ee7b7, var(--success))',
        };
      });

      setConversations((prev) => {
        const newConvs = [...mappedDirect, ...mappedGroups];
        // Preserve any local placeholder conversations that haven't been established on the backend yet
        const placeholders = prev.filter(p => !newConvs.find(n => n.id === p.id) && p.msg === 'Start a conversation');
        return [...placeholders, ...newConvs];
      });
      return [...mappedDirect, ...mappedGroups];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  /* ── Handle ?userId deep-link from people page ── */
  useEffect(() => {
    if (!user) return;
    
    const paramUserId = searchParams.get('userId');
    const paramName = searchParams.get('name');

    if (paramUserId) {
      // Store the name in case this user isn't in conversations yet
      if (paramName) {
        pendingNamesRef.current[paramUserId] = decodeURIComponent(paramName);
      }

      // Load conversations first, then check if this user is already there
      fetchConversations().then((convs) => {
        const exists = convs.find((c: any) => c.id === paramUserId);
        if (!exists && paramName) {
          // Inject a placeholder conversation so chat opens immediately
          const placeholder = {
            id: paramUserId,
            name: decodeURIComponent(paramName),
            group: false,
            msg: 'Start a conversation',
            unread: 0,
            initials: decodeURIComponent(paramName).substring(0, 2).toUpperCase(),
            avatarGrad: 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
            online: false,
          };
          setConversations((prev) => {
            if (prev.find((c) => c.id === paramUserId)) return prev;
            return [placeholder, ...prev];
          });
        }
        setSelected(paramUserId);
        // Remove query params from URL
        router.replace('/chat');
      });
    } else {
      fetchConversations();
    }
  }, [user, searchParams, router]);

  /* ── Socket.io setup ── */
  useEffect(() => {
    if (!user) return;
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const baseUrl = url.replace('/api', '');
    const s = io(`${baseUrl}/chat`, { autoConnect: true, transports: ['websocket'] });

    s.on('connect', () => { 
      const token = localStorage.getItem('localloop_token');
      s.emit('register', { token }); 
    });

    s.on('receive_message', (msg: any) => {
      const cur = selectedRef.current;
      setMessages((prev) => {
        if (!cur || (cur !== msg.senderId && cur !== msg.receiverId)) return prev;
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, mine: false, text: msg.content, time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
      });
      fetchConversations();
    });

    s.on('message_sent', (msg: any) => {
      const cur = selectedRef.current;
      setMessages((prev) => {
        if (!cur || (cur !== msg.senderId && cur !== msg.receiverId)) return prev;
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, mine: true, text: msg.content, time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
      });
      fetchConversations();
    });

    s.on('community_message', (msg: any) => {
      const cur = selectedRef.current;
      setMessages((prev) => {
        if (cur !== msg.communityId) return prev;
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, mine: msg.userId === user.id, text: msg.content, time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
      });
      fetchConversations();
    });

    s.on('user_typing', (data: any) => {
      if (selectedRef.current === data.userId) setTypingState(data.isTyping);
    });

    socketRef.current = s;
    return () => { s.disconnect(); };
  }, [user]);

  /* ── Load messages when conversation selected ── */
  useEffect(() => {
    if (!selected || !user) return;
    const conv = conversations.find((c) => c.id === selected);
    if (!conv) return;

    const loadMsgs = async () => {
      try {
        if (conv.group) {
          socketRef.current?.emit('join_community', { communityId: conv.id });
          const res = await api.getCommunityMessages(conv.id);
          setMessages(res.data.map((m: any) => ({
            ...m, mine: m.userId === user.id, text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })));
        } else {
          socketRef.current?.emit('mark_read', { userId: user.id, senderId: conv.id });
          const res = await api.getMessages(conv.id);
          setMessages(res.data.map((m: any) => ({
            ...m, mine: m.senderId === user.id, text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: m.isRead,
          })));
          setTimeout(fetchConversations, 500);
        }
      } catch (e) {
        setMessages([]); // new conversation = empty messages
      }
    };
    loadMsgs();

    return () => {
      const c2 = conversations.find((c) => c.id === selected);
      if (c2?.group) socketRef.current?.emit('leave_community', { communityId: c2.id });
    };
  }, [selected, user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingState]);

  /* ── User search for new conversation ── */
  useEffect(() => {
    if (!userSearch.trim()) { setUserResults([]); return; }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.searchUsers({ search: userSearch, limit: 10 });
        setUserResults(res.data || []);
      } catch { setUserResults([]); }
      setSearchLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const startConversation = (u: any) => {
    pendingNamesRef.current[u.id] = u.name;
    setConversations((prev) => {
      if (prev.find((c) => c.id === u.id)) return prev;
      return [{
        id: u.id, name: u.name, group: false,
        msg: 'Start a conversation', unread: 0,
        initials: u.name?.substring(0, 2).toUpperCase() || 'U',
        avatarGrad: 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
        online: false,
      }, ...prev];
    });
    setSelected(u.id);
    setShowNewChat(false);
    setUserSearch('');
    setUserResults([]);
  };

  /* ── Send message ── */
  const activeConv = conversations.find((c) => c.id === selected);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !user || !activeConv) return;
    if (activeConv.group) {
      socketRef.current?.emit('send_community_message', { userId: user.id, communityId: activeConv.id, content: newMsg });
    } else {
      socketRef.current?.emit('send_message', { senderId: user.id, receiverId: activeConv.id, content: newMsg });
    }
    setNewMsg('');
    socketRef.current?.emit('typing', { senderId: user.id, receiverId: activeConv.id, isTyping: false });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMsg(e.target.value);
    if (!activeConv || activeConv.group) return;
    socketRef.current?.emit('typing', { senderId: user?.id, receiverId: activeConv.id, isTyping: e.target.value.length > 0 });
  };

  const tabs = ['All', 'Direct', 'Groups'];
  const filteredConvs = conversations.filter((c) => {
    if (tab === 'Groups') return c.group;
    if (tab === 'Direct') return !c.group;
    return true;
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>

      {/* ══════════ CONVERSATIONS SIDEBAR ══════════ */}
      <div style={{
        width: 340, flexShrink: 0, flexDirection: 'column', display: selected ? 'none' : 'flex',
        borderRight: '1px solid var(--border)', background: 'var(--bg-card)',
      }} className="md-always-flex">
        <div style={{ padding: '20px 18px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              title="New Conversation"
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              <Plus size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                background: tab === t ? 'var(--primary)' : 'var(--border-light)',
                color: tab === t ? '#fff' : '#64748b', transition: 'all 0.15s',
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConvs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <MessageCircle size={32} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>No conversations yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Tap + to start a new chat</p>
            </div>
          ) : filteredConvs.map((c) => {
            const isActive = selected === c.id;
            return (
              <button key={c.id} onClick={() => { setSelected(c.id); setMessages([]); }} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                background: isActive ? 'rgba(99,102,241,0.06)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.1s',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                    background: c.avatarGrad, color: '#fff',
                  }}>{c.initials}</div>
                  {c.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: 'var(--success)', border: '2.5px solid #fff' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                    {c.group && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: 4 }}>GROUP</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{c.msg}</p>
                </div>
                {c.unread > 0 && <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: 'var(--primary)', color: '#fff', flexShrink: 0 }}>{c.unread}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════ CHAT AREA ══════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', minWidth: 0 }}>
        {activeConv ? (
          <>
            {/* Header */}
            <div style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}><ArrowLeft size={20} /></button>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: activeConv.avatarGrad, color: '#fff' }}>{activeConv.initials}</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{activeConv.name}</p>
                  {typingState && <p style={{ fontSize: 11, color: 'var(--success)', margin: 0 }}>typing…</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[Video, Phone, MoreVertical].map((Icon, i) => (
                  <button key={i} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 8, borderRadius: 10 }}><Icon size={18} /></button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--text-muted)' }}>
                  <MessageCircle size={36} style={{ opacity: 0.4 }} />
                  <p style={{ fontSize: 14, fontWeight: 500 }}>No messages yet</p>
                  <p style={{ fontSize: 12 }}>Say hi to {activeConv.name}! 👋</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start', gap: 8 }}>
                  {!m.mine && (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: activeConv.avatarGrad, color: '#fff', alignSelf: 'flex-end', flexShrink: 0 }}>
                      {(m.user?.name || m.sender?.name || activeConv.name)?.charAt(0)}
                    </div>
                  )}
                  <div style={{ maxWidth: '65%' }}>
                    {!m.mine && activeConv.group && (
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 3, marginLeft: 4 }}>{m.user?.name}</p>
                    )}
                    <div style={{
                      padding: '12px 16px', fontSize: 14, lineHeight: 1.55,
                      background: m.mine ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : '#fff',
                      color: m.mine ? '#fff' : 'var(--text-primary)',
                      borderRadius: m.mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      border: m.mine ? 'none' : '1px solid var(--border-light)',
                    }}>{m.text}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)', marginTop: 4, justifyContent: m.mine ? 'flex-end' : 'flex-start' }}>
                      {m.time}
                      {m.mine && m.read && <CheckCheck size={12} style={{ color: 'var(--primary)' }} />}
                      {m.mine && !m.read && <Check size={12} />}
                    </div>
                  </div>
                </div>
              ))}
              {typingState && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: activeConv.avatarGrad, color: '#fff', alignSelf: 'flex-end', flexShrink: 0 }}>{activeConv.initials.charAt(0)}</div>
                  <div style={{ padding: '12px 18px', background: 'var(--bg-card)', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border-light)', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map((i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)', animation: `typingBounce 1.4s infinite ${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={send} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Mic size={19} /></button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Smile size={19} /></button>
              <input
                value={newMsg} onChange={handleTyping}
                placeholder={`Message ${activeConv.name}…`}
                style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '10px 16px', fontSize: 14, outline: 'none', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
              />
              <button type="submit" disabled={!newMsg.trim()} style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: newMsg.trim() ? 'pointer' : 'default', background: newMsg.trim() ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--border)', color: '#fff', transition: 'all 0.15s' }}>
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ width: 80, height: 80, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.08)', marginBottom: 16 }}>
              <MessageCircle size={36} style={{ color: 'var(--primary)' }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>Select a conversation</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Or start a new one</p>
            <button
              onClick={() => setShowNewChat(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
            >
              <Plus size={16} /> New Conversation
            </button>
          </div>
        )}
      </div>

      {/* ══════════ NEW CONVERSATION MODAL ══════════ */}
      {showNewChat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowNewChat(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, width: 420, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>New Conversation</h3>
              <button onClick={() => setShowNewChat(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                autoFocus
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search people by name or company…"
                style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchLoading && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Searching…</p>}
              {!searchLoading && userSearch && userResults.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No users found</p>
              )}
              {!searchLoading && !userSearch && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>Type a name to search for people</p>
              )}
              {userResults.map((u: any) => (
                <button key={u.id} onClick={() => startConversation(u)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14,
                  background: 'var(--bg-primary)', border: '1px solid transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  textAlign: 'left', transition: 'all 0.15s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border-light)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #c4b5fd, #a78bfa)', color: '#fff', flexShrink: 0 }}>
                    {(u.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{u.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{u.company || u.university || u.city || ''}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes typingBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
        @media (min-width: 768px) { .md-always-flex { display: flex !important; } }
      `}</style>
    </div>
  );
}

/* ── Page wrapper with Suspense (required for useSearchParams) ── */
export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: 'var(--text-muted)' }}>Loading…</div>}>
      <ChatInner />
    </Suspense>
  );
}
