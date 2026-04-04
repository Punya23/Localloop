'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  ArrowLeft, Users, Send, MessageCircle, Clock,
  MessagesSquare, ChevronDown,
} from 'lucide-react';

type ViewMode = 'posts' | 'chat';

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { isAuthenticated, user } = useAuthStore();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  // Chat state
  const [viewMode, setViewMode] = useState<ViewMode>('posts');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newChatMsg, setNewChatMsg] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getCommunity(id),
        api.getCommunityPosts(id),
      ]).then(([comm, postData]) => {
        setCommunity(comm);
        setPosts(postData.data || []);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  // Load chat messages when switching to chat view
  useEffect(() => {
    if (viewMode === 'chat' && id && isAuthenticated) {
      setChatLoading(true);
      api.getCommunityMessages(id)
        .then((res) => setChatMessages(res.data || []))
        .catch(console.error)
        .finally(() => setChatLoading(false));
    }
  }, [viewMode, id, isAuthenticated]);

  // Auto-scroll chat
  useEffect(() => {
    if (viewMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, viewMode]);

  // Poll for new chat messages every 5s
  useEffect(() => {
    if (viewMode !== 'chat' || !id || !isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.getCommunityMessages(id);
        setChatMessages(res.data || []);
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [viewMode, id, isAuthenticated]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      await api.createPost({ content: newPost, communityId: id });
      const postData = await api.getCommunityPosts(id);
      setPosts(postData.data || []);
      setNewPost('');
    } catch (err: any) { alert(err.message); }
    finally { setPosting(false); }
  };

  const handleComment = async (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      await api.addComment(postId, text);
      const postData = await api.getCommunityPosts(id);
      setPosts(postData.data || []);
      setCommentText({ ...commentText, [postId]: '' });
    } catch (err: any) { alert(err.message); }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMsg.trim()) return;
    setSendingChat(true);
    try {
      const msg = await api.sendCommunityMessage(id, newChatMsg);
      setChatMessages((prev) => [...prev, msg]);
      setNewChatMsg('');
    } catch (err: any) { alert(err.message || 'Failed to send'); }
    finally { setSendingChat(false); }
  };

  if (loading) {
    return <div className="p-6 lg:p-8"><div className="shimmer h-64 rounded-xl max-w-3xl" /></div>;
  }

  if (!community) {
    return <div className="p-6 text-center py-20"><h2>Community not found</h2></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link href="/communities" className="flex items-center gap-2 text-sm mb-6 no-underline" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to communities
      </Link>

      {/* Community Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            {community.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{community.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><Users size={14} /> {community._count?.members || community.memberCount} members</span>
              <span>·</span>
              <span>{community._count?.posts || 0} posts</span>
            </div>
            {community.description && <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{community.description}</p>}
          </div>
        </div>
      </div>

      {/* ── View Mode Toggle ── */}
      {isAuthenticated && (
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          background: '#f8f9fc', borderRadius: '12px', padding: '4px',
        }}>
          <button
            onClick={() => setViewMode('posts')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: viewMode === 'posts' ? '#fff' : 'transparent',
              color: viewMode === 'posts' ? '#6366f1' : '#94a3b8',
              boxShadow: viewMode === 'posts' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <MessageCircle size={16} /> Posts
          </button>
          <button
            onClick={() => setViewMode('chat')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: viewMode === 'chat' ? '#fff' : 'transparent',
              color: viewMode === 'chat' ? '#6366f1' : '#94a3b8',
              boxShadow: viewMode === 'chat' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <MessagesSquare size={16} /> Group Chat
          </button>
        </div>
      )}

      {/* ══════════ POSTS VIEW ══════════ */}
      {viewMode === 'posts' && (
        <>
          {/* New Post */}
          {isAuthenticated && (
            <form onSubmit={handlePost} className="glass-card p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <textarea className="input-field text-sm" rows={2} placeholder="Share something with the community..." value={newPost}
                            onChange={(e) => setNewPost(e.target.value)} required />
                  <div className="flex justify-end mt-2">
                    <button type="submit" className="btn-primary text-sm flex items-center gap-2" disabled={posting || !newPost.trim()}>
                      <Send size={14} /> {posting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Posts Feed */}
          <div className="flex flex-col gap-4">
            {posts.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <MessageCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No posts yet. Start the conversation!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="glass-card p-5">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                         style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                      {post.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{post.user?.name}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm mb-4 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>

                  {/* Comments */}
                  <div style={{ borderTop: '1px solid var(--border)' }} className="pt-3">
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                      <MessageCircle size={12} className="inline mr-1" /> {post._count?.comments || 0} comments
                    </p>
                    {post.comments?.map((c: any) => (
                      <div key={c.id} className="flex gap-2 mb-2 ml-4">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                             style={{ background: 'var(--bg-card)' }}>
                          {c.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-medium">{c.user?.name}</span>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.content}</p>
                        </div>
                      </div>
                    ))}

                    {isAuthenticated && (
                      <div className="flex gap-2 mt-2">
                        <input className="input-field text-xs flex-1" placeholder="Write a comment..."
                               value={commentText[post.id] || ''}
                               onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })} />
                        <button onClick={() => handleComment(post.id)} className="btn-primary text-xs px-3" disabled={!commentText[post.id]?.trim()}>
                          <Send size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ══════════ GROUP CHAT VIEW ══════════ */}
      {viewMode === 'chat' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 380px)', minHeight: '400px' }}>
          {/* Chat Header */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <MessagesSquare size={18} style={{ color: '#6366f1' }} />
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>Group Chat</span>
              <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>
                {community._count?.members || community.memberCount} members
              </span>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflow: 'auto', padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {chatLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                Loading messages...
              </div>
            ) : chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <MessagesSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px', fontWeight: 500 }}>No messages yet</p>
                <p style={{ fontSize: '12px' }}>Be the first to say something!</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.user?.id === user?.id || msg.userId === user?.id;
                return (
                  <div key={msg.id} style={{
                    display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
                    gap: '8px', animation: 'fadeIn 0.3s ease',
                  }}>
                    {!isMe && (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                        fontSize: '12px', fontWeight: 700, color: '#6366f1',
                        alignSelf: 'flex-end',
                      }}>
                        {(msg.user?.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ maxWidth: '70%' }}>
                      {!isMe && (
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', marginBottom: '4px', marginLeft: '4px' }}>
                          {msg.user?.name}
                        </p>
                      )}
                      <div style={{
                        padding: '10px 16px', fontSize: '14px', lineHeight: 1.5,
                        background: isMe
                          ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                          : '#fff',
                        color: isMe ? '#fff' : '#1a1a2e',
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        border: isMe ? 'none' : '1px solid #f0f1f5',
                        boxShadow: isMe ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        {msg.content}
                      </div>
                      <p style={{
                        fontSize: '10px', color: '#94a3b8', marginTop: '4px',
                        textAlign: isMe ? 'right' : 'left',
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {isAuthenticated ? (
            <form onSubmit={handleSendChat} style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
              borderTop: '1px solid var(--border)',
            }}>
              <input
                value={newChatMsg}
                onChange={(e) => setNewChatMsg(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1, background: '#f8f9fc', border: '1px solid #e5e7ee',
                  borderRadius: '12px', padding: '10px 16px', fontSize: '14px',
                  outline: 'none', color: '#1a1a2e', fontFamily: 'Inter, sans-serif',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7ee'}
              />
              <button type="submit" disabled={!newChatMsg.trim() || sendingChat} style={{
                width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', border: 'none',
                cursor: newChatMsg.trim() ? 'pointer' : 'default',
                background: newChatMsg.trim()
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : '#e5e7ee',
                color: '#fff',
                boxShadow: newChatMsg.trim() ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                transition: 'all 0.2s',
              }}><Send size={16} /></button>
            </form>
          ) : (
            <div style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', color: '#94a3b8', borderTop: '1px solid var(--border)' }}>
              <Link href="/login" style={{ color: '#6366f1', fontWeight: 600 }}>Log in</Link> to join the conversation
            </div>
          )}
        </div>
      )}
    </div>
  );
}
