'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  ArrowLeft, Users, Send, MessageCircle, Clock,
  MessagesSquare, ChevronDown, CheckCircle2, BarChart2, Crown,
  Award, Image as ImageIcon, TrendingUp
} from 'lucide-react';

type ViewMode = 'chat' | 'posts' | 'polls' | 'members' | 'media';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isAuthenticated, user } = useAuthStore();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
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

  // Poll state
  const [polls, setPolls] = useState<any[]>([]);
  const [newPollQ, setNewPollQ] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);
  const [creatingPoll, setCreatingPoll] = useState(false);

  // Members state
  const [members, setMembers] = useState<any[]>([]);
  const [isTogglingAction, setIsTogglingAction] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getCommunity(id),
        api.getCommunityPosts(id),
        api.getCommunityPolls(id).catch(() => []),
        api.getCommunityMembers(id).catch(() => ({ data: [] })),
      ]).then(([comm, postData, pollsData, membersData]) => {
        setCommunity(comm);
        setPosts(postData.data || []);
        setPolls(pollsData || []);
        setMembers(membersData.data || []);
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
      await api.createPost({ title: newPostTitle || undefined, content: newPost, communityId: id });
      const postData = await api.getCommunityPosts(id);
      setPosts(postData.data || []);
      setNewPost('');
      setNewPostTitle('');
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

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const opts = newPollOptions.filter(o => o.trim());
    if (!newPollQ.trim() || opts.length < 2) return;
    setCreatingPoll(true);
    try {
      await api.createCommunityPoll(id, { question: newPollQ, options: opts });
      const pd = await api.getCommunityPolls(id);
      setPolls(pd || []);
      setNewPollQ('');
      setNewPollOptions(['', '']);
      setViewMode('polls');
    } catch (err: any) { alert(err.message); }
    finally { setCreatingPoll(false); }
  };

  const handleVotePoll = async (pollId: string, optionIndex: number) => {
    try {
      await api.voteCommunityPoll(id, pollId, optionIndex);
      const pd = await api.getCommunityPolls(id);
      setPolls(pd || []);
    } catch (err: any) { alert(err.message); }
  };

  const handleToggleJoin = async () => {
    if (!isAuthenticated) return router.push('/login');
    if (isTogglingAction) return;
    
    const isMember = members.some((m: any) => m.userId === user?.id || m.user?.id === user?.id);
    setIsTogglingAction(true);
    try {
      if (isMember) {
        if (confirm('Are you sure you want to leave this community?')) {
          await api.leaveCommunity(id);
          setMembers(prev => prev.filter((m: any) => m.userId !== user?.id && m.user?.id !== user?.id));
          setCommunity((prev: any) => ({
            ...prev,
            _count: { ...prev._count, members: Math.max(0, (prev._count?.members || 0) - 1) },
          }));
        }
      } else {
        await api.joinCommunity(id);
        const md = await api.getCommunityMembers(id);
        setMembers(md.data || []);
        setCommunity((prev: any) => ({
          ...prev,
          _count: { ...prev._count, members: (prev._count?.members || 0) + 1 },
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update community status');
    } finally {
      setIsTogglingAction(false);
    }
  };

  if (loading) {
    return <div className="p-6 lg:p-8"><div className="shimmer h-64 rounded-xl max-w-3xl" /></div>;
  }

  if (!community) {
    return <div className="p-6 text-center py-20"><h2>Community not found</h2></div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-32 max-w-6xl mx-auto w-full">
      <Link href="/communities" className="flex items-center gap-2 text-sm mb-6 no-underline" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to communities
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="min-w-0">
          {/* Community Header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                {community.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{community.name}</h1>
                    <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><Users size={14} /> {community._count?.members || community.memberCount} members</span>
                      <span>·</span>
                      <span>{community._count?.posts || 0} posts</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleJoin} 
                    disabled={isTogglingAction}
                    style={{
                      padding: '8px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 600,
                      cursor: isTogglingAction ? 'default' : 'pointer',
                      border: members.some((m: any) => m.userId === user?.id || m.user?.id === user?.id) 
                              ? '1px solid var(--border)' : 'none',
                      background: members.some((m: any) => m.userId === user?.id || m.user?.id === user?.id) 
                                  ? 'transparent' : 'var(--primary)',
                      color: members.some((m: any) => m.userId === user?.id || m.user?.id === user?.id) 
                             ? 'var(--text-muted)' : '#fff',
                      opacity: isTogglingAction ? 0.7 : 1,
                      transition: 'all 0.15s'
                    }}
                  >
                    {isTogglingAction ? 'Wait...' : 
                     (members.some((m: any) => m.userId === user?.id || m.user?.id === user?.id) ? 'Leave Community' : 'Join Community')}
                  </button>
                </div>
                {community.description && <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{community.description}</p>}
              </div>
            </div>
          </div>

          {/* ── View Mode Toggle ── */}
          {isAuthenticated && (
            <div style={{
              display: 'flex', gap: '4px', marginBottom: '20px',
              background: 'var(--bg-primary)', borderRadius: '12px', padding: '4px',
              overflowX: 'auto', WebkitOverflowScrolling: 'touch',
            }}>
              {[
                { id: 'posts', label: 'Discussions', icon: MessageCircle },
                { id: 'chat', label: 'General Chat', icon: MessagesSquare },
                { id: 'polls', label: 'Polls', icon: BarChart2 },
                { id: 'members', label: 'Members', icon: Users },
              ].map(tab => {
                const Icon = tab.icon;
                const active = viewMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as ViewMode)}
                    style={{
                      flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '10px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      background: active ? '#fff' : 'transparent',
                      color: active ? 'var(--primary)' : 'var(--text-muted)',
                      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* ══════════ POSTS VIEW ══════════ */}
          {viewMode === 'posts' && (
            <>
              {/* New Post */}
              {isAuthenticated && (
                <form onSubmit={handlePost} className="glass-card p-5 mb-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MessagesSquare size={16} className="text-primary" /> Start a New Topic
                  </h3>
                  <div className="flex flex-col gap-3">
                    <input
                      className="input-field text-sm font-semibold"
                      placeholder="Topic Title (optional)..."
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                        {user?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <textarea className="input-field text-sm" rows={2} placeholder="What do you want to discuss?" value={newPost}
                          onChange={(e) => setNewPost(e.target.value)} required />
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex gap-2">
                            <button type="button" className="p-2 text-muted hover:text-primary transition-colors"><ImageIcon size={18} /></button>
                          </div>
                          <button type="submit" className="btn-primary text-sm flex items-center gap-2" disabled={posting || !newPost.trim()}>
                            <Send size={14} /> {posting ? 'Posting...' : 'Send to Community'}
                          </button>
                        </div>
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
                    <p style={{ color: 'var(--text-muted)' }}>No discussions yet. Start a new topic!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="glass-card p-5 hover:border-primary/30 transition-colors">
                      {/* Post Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                          {post.user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            {post.user?.name}
                            {post.user?.isMentor && <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Award size={10} /> Mentor</span>}
                          </p>
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Post Content */}
                      {post.title && <h3 className="text-lg font-bold mb-2 break-words">{post.title}</h3>}
                      <p className="text-sm mb-4 whitespace-pre-wrap break-words" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>

                      {/* Comments */}
                      <div style={{ borderTop: '1px solid var(--border)' }} className="pt-3">
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                          <MessageCircle size={12} className="inline mr-1" /> {post._count?.comments || 0} comments
                        </p>
                        {post.comments?.slice(0, 3).map((c: any) => (
                          <div key={c.id} className="flex gap-2 mb-2 ml-4">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ background: 'var(--bg-card)' }}>
                              {c.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-medium flex items-center gap-2">
                                {c.user?.name}
                                {c.user?.isMentor && <span className="bg-amber-100 text-amber-700 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Award size={8} /> Mentor</span>}
                              </span>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.content}</p>
                            </div>
                          </div>
                        ))}

                        {isAuthenticated && (
                          <div className="flex gap-2 mt-3 bg-gray-50 p-2 rounded-xl">
                            <input className="bg-transparent border-none outline-none text-xs flex-1 px-2" placeholder="Write a comment..."
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })} />
                            <button onClick={() => handleComment(post.id)} className="btn-primary text-xs px-3 py-1.5" disabled={!commentText[post.id]?.trim()}>
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
            <div className="glass-card overflow-hidden" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 420px)', minHeight: '500px' }}>
              {/* Chat Header */}
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <MessagesSquare size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>General Chat</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    {community._count?.members || community.memberCount} members online
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflow: 'auto', padding: '16px 20px',
                display: 'flex', flexDirection: 'column', gap: '12px',
                backgroundImage: 'radial-gradient(var(--border) 0.5px, transparent 0.5px)',
                backgroundSize: '20px 20px',
              }}>
                {chatLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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
                            fontSize: '12px', fontWeight: 700, color: 'var(--primary)',
                            alignSelf: 'flex-end',
                          }}>
                            {(msg.user?.name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ maxWidth: '70%' }}>
                          {!isMe && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', marginLeft: '4px' }}>
                              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)' }}>
                                {msg.user?.name}
                              </p>
                              {msg.user?.isMentor && <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '9px', fontWeight: 700, padding: '2px 4px', borderRadius: '4px', textTransform: 'uppercase' }}>Mentor</span>}
                            </div>
                          )}
                          <div style={{
                            padding: '10px 16px', fontSize: '14px', lineHeight: 1.5,
                            background: isMe
                              ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                              : '#fff',
                            color: isMe ? '#fff' : 'var(--text-primary)',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            border: isMe ? 'none' : '1px solid var(--border-light)',
                            boxShadow: isMe ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                          }}>
                            {msg.content}
                          </div>
                          <p style={{
                            fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px',
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
                  borderTop: '1px solid var(--border)', background: '#fff'
                }}>
                  <input
                    value={newChatMsg}
                    onChange={(e) => setNewChatMsg(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      borderRadius: '12px', padding: '10px 16px', fontSize: '14px',
                      outline: 'none', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <button type="submit" disabled={!newChatMsg.trim() || sendingChat} style={{
                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', border: 'none',
                    background: newChatMsg.trim() ? 'var(--primary)' : 'var(--border)',
                    color: '#fff', cursor: 'pointer'
                  }}><Send size={16} /></button>
                </form>
              ) : (
                <div style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                  <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link> to join the conversation
                </div>
              )}
            </div>
          )}

          {/* Members/Polls views remain handled similarly... */}
          {/* (Trimming for brevity in this replace call, assuming mode logic) */}
          {viewMode === 'polls' && (
            /* ... (keep existing poll code) ... */
            <div className="flex flex-col gap-6">
              {isAuthenticated && (
                <form onSubmit={handleCreatePoll} className="glass-card p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart2 size={16} className="text-primary" /> Create a Poll</h3>
                  <input
                    className="input-field w-full text-sm mb-3" placeholder="Ask a question..."
                    value={newPollQ} onChange={e => setNewPollQ(e.target.value)} required />
                  <div className="space-y-2 mb-3">
                    {newPollOptions.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input className="input-field flex-1 text-sm py-2" placeholder={`Option ${i + 1}`}
                          value={opt} onChange={e => {
                            const newOpts = [...newPollOptions];
                            newOpts[i] = e.target.value;
                            setNewPollOptions(newOpts);
                          }} required={i < 2} />
                        {i >= 2 && (
                          <button type="button" onClick={() => setNewPollOptions(newPollOptions.filter((_, idx) => idx !== i))}
                            className="text-red-500 p-2 hover:bg-red-50 rounded">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {newPollOptions.length < 5 && (
                    <button type="button" onClick={() => setNewPollOptions([...newPollOptions, ''])}
                      className="text-xs text-primary font-medium hover:underline block mb-3">+ Add Option</button>
                  )}
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary text-sm px-4" disabled={creatingPoll || !newPollQ.trim()}>
                      {creatingPoll ? 'Publishing...' : 'Publish Poll'}
                    </button>
                  </div>
                </form>
              )}

              {polls.length === 0 ? (
                <div className="glass-card p-8 text-center text-gray-500">
                  <BarChart2 size={40} className="mx-auto mb-3 opacity-50" />
                  <p>No polls yet in this community.</p>
                </div>
              ) : (
                polls.map(poll => {
                  let optsArray: string[] = [];
                  try { optsArray = Array.isArray(poll.options) ? poll.options : JSON.parse(poll.options); } catch (e) { optsArray = ['Option error']; }
                  const totalVotes = poll.votes?.length || 0;
                  const hasVoted = poll.votes?.find((v: any) => v.userId === user?.id);

                  return (
                    <div key={poll.id} className="glass-card p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 font-inter">
                          {poll.createdBy?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{poll.createdBy?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400 font-inter">{new Date(poll.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{poll.question}</h3>
                      <div className="space-y-3">
                        {optsArray.map((opt: string, i: number) => {
                          const votesForOpt = poll.votes?.filter((v: any) => v.optionIndex === i).length || 0;
                          const percent = totalVotes > 0 ? Math.round((votesForOpt / totalVotes) * 100) : 0;
                          const isMyVote = hasVoted?.optionIndex === i;

                          return (
                            <div key={i} className="relative group cursor-pointer" onClick={() => !hasVoted && handleVotePoll(poll.id, i)}>
                              <div className={`w-full overflow-hidden rounded-xl border relative z-10 transition-all ${isMyVote ? 'border-primary shadow-[0_0_0_1px_rgba(99,102,241,1)]' : 'border-gray-200 hover:border-indigo-300'}`}>
                                <div className="absolute inset-0 bg-indigo-50" style={{ width: `${hasVoted ? percent : 0}%`, transition: 'width 0.5s ease' }} />
                                <div className="relative z-20 px-4 py-3 flex justify-between items-center text-sm">
                                  <span className={`font-medium ${isMyVote ? 'text-primary font-semibold' : 'text-gray-700'}`}>
                                    {isMyVote && <CheckCircle2 size={14} className="inline mr-2 text-primary" />}
                                    {opt}
                                  </span>
                                  {hasVoted && <span className="font-semibold text-gray-500">{percent}%</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 text-xs text-gray-400 font-medium">{totalVotes} votes</div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {viewMode === 'members' && (
            <div className="glass-card p-4">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-primary" /> Members ({community._count?.members || community.memberCount})
                </h3>
              </div>
              <div className="grid grid-cols-1 divide-y divide-gray-50">
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-white border border-gray-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {member.user.avatar ? <img src={member.user.avatar} className="w-full h-full object-cover" alt="" /> : member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{member.user.name}</h4>
                        {member.role === 'ADMIN' && <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Crown size={10} /> Admin</span>}
                        {member.user.isMentor && <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Award size={10} /> Mentor</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{member.user.company ? `At ${member.user.company}` : member.user.university ? `Student at ${member.user.university}` : member.user.bio || 'New member'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" /> Active Discussions
            </h3>
            <div className="flex flex-col gap-3">
              {/* General Chat Entry */}
              <div
                className="group cursor-pointer p-2 rounded-xl hover:bg-indigo-50/50 transition-all"
                onClick={() => setViewMode('chat')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <MessagesSquare size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">General Chat</p>
                    <p className="text-[10px] text-muted">Community live lobby</p>
                  </div>
                </div>
              </div>

              <div className="my-1 border-t border-gray-100/50" />

              {posts.filter(p => p.title).slice(0, 5).map(p => (
                <div key={p.id} className="group cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-all">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-1">{p.title}</p>
                  <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                    <MessageCircle size={10} /> {p._count?.comments || 0} participants
                  </p>
                </div>
              ))}
              {posts.filter(p => p.title).length === 0 && (
                <p className="text-xs text-muted italic">No active topics yet. Start one!</p>
              )}
            </div>
          </div>

          <div className="glass-card p-5 bg-gradient-to-br from-indigo-50 to-white border-primary/10">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
              <Crown size={16} className="text-amber-500" /> Community Rules
            </h3>
            <ul className="text-[11px] space-y-2 text-secondary">
              <li>1. Be respectful to all members</li>
              <li>2. No spam or self-promotion</li>
              <li>3. Stick to relevant discussions</li>
              <li>4. Help newcomers get settled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
