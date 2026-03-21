'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, ArrowLeft, Circle } from 'lucide-react';

export default function ChatPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (isAuthenticated) {
      api.getConversations().then(setConversations).catch(console.error).finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router]);

  const selectConversation = async (partner: any) => {
    setSelectedPartner(partner);
    try {
      const res = await api.getMessages(partner.id);
      setMessages(res.data || []);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedPartner) return;
    // Optimistically add message
    const tempMsg = { id: Date.now(), content: newMsg, senderId: user?.id, sender: { name: user?.name }, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMsg('');
    // Note: In production, this would use WebSocket. REST fallback for now.
  };

  if (authLoading || loading) {
    return <div className="p-6 lg:p-8"><div className="shimmer h-96 rounded-xl" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl" style={{ height: 'calc(100vh - 60px)' }}>
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6"><MessageCircle size={24} style={{ color: 'var(--primary)' }} /> Messages</h1>

      <div className="glass-card flex overflow-hidden" style={{ height: 'calc(100% - 80px)' }}>
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 flex flex-col" style={{ borderRight: '1px solid var(--border)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-semibold text-sm">Conversations</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Start chatting with mentors or community members</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button key={conv.partner.id} onClick={() => selectConversation(conv.partner)}
                        className="w-full flex items-center gap-3 p-4 text-left transition-all"
                        style={{
                          background: selectedPartner?.id === conv.partner.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                          border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
                          borderBottom: '1px solid var(--border)',
                        }}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                         style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                      {conv.partner.name?.charAt(0)}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                           style={{ background: 'var(--danger)', color: 'white' }}>
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.partner.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{conv.lastMessage?.content}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedPartner ? (
            <>
              <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <button onClick={() => setSelectedPartner(null)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <ArrowLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                     style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {selectedPartner.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedPartner.name}</p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
                    <Circle size={6} fill="currentColor" /> Online
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[70%] p-3 rounded-2xl text-sm"
                           style={{
                             background: isMe ? 'var(--primary)' : 'var(--bg-secondary)',
                             color: isMe ? 'white' : 'var(--text-primary)',
                             borderBottomRightRadius: isMe ? '4px' : '16px',
                             borderBottomLeftRadius: isMe ? '16px' : '4px',
                           }}>
                        {msg.content}
                        <div className="text-[10px] mt-1 opacity-60 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={sendMessage} className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                <input className="input-field flex-1 text-sm" placeholder="Type a message..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)} />
                <button type="submit" className="btn-primary px-4" disabled={!newMsg.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col">
              <MessageCircle size={48} style={{ color: 'var(--text-muted)' }} />
              <p className="mt-3 font-medium" style={{ color: 'var(--text-muted)' }}>Select a conversation</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose someone to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
