'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Users, Plus, Shield, GraduationCap, Code, Heart,
  MessageSquare, Share2, Bookmark, SlidersHorizontal,
  Image as ImageIcon, Send, Smile, ChevronDown
} from 'lucide-react';

/* ── Avatar Colors ──────────────────────────────────── */

const avatarGradients = [
  'linear-gradient(135deg, #c4b5fd, #a78bfa)',
  'linear-gradient(135deg, #6ee7b7, #34d399)',
  'linear-gradient(135deg, #93c5fd, #60a5fa)',
  'linear-gradient(135deg, #fca5a5, #f87171)',
  'linear-gradient(135deg, #fde68a, #fbbf24)',
];

/* ── Communities Page ─────────────────────────────────── */

export default function CommunitiesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All Discoveries');
  const [communities, setCommunities] = useState<any[]>([]);
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchJoined = () => {
    if (isAuthenticated) {
      api.getMyCommunities().then(data => {
        setMyCommunities(data || []);
        const joinedIds = new Set((data || []).map((c: any) => c.id));
        setJoinedCommunities(joinedIds as any);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    api.getCommunities().then((data) => {
      if (data?.length > 0) setCommunities(data);
    }).catch(() => {});
    fetchJoined();
  }, [isAuthenticated]);

  const categories = ['All Discoveries', 'University', 'Tech', 'Relocation', 'Women Only'];

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleJoin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return router.push('/login');
    if (loadingAction === id) return;
    
    setLoadingAction(id);
    try {
      if (joinedCommunities.has(id)) {
        await api.leaveCommunity(id);
        setJoinedCommunities(prev => { const n = new Set(prev); n.delete(id); return n; });
        setMyCommunities(prev => prev.filter(c => c.id !== id));
      } else {
        await api.joinCommunity(id);
        setJoinedCommunities(prev => { const n = new Set(prev); n.add(id); return n; });
        fetchJoined(); // Refetch to get populated community data
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 24px 100px' }}>

      {/* ══════════ Header ══════════ */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
          Find your people
        </h1>
        <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.5 }}>
          Discover local groups based on your journey and interests.
        </p>
      </div>

      {/* ══════════ Category Pills ══════════ */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '28px',
        overflowX: 'auto', paddingBottom: '4px',
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '9px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              border: activeCategory === cat ? 'none' : '1px solid #e5e7ee',
              background: activeCategory === cat ? '#6366f1' : '#fff',
              color: activeCategory === cat ? '#fff' : '#64748b',
              transition: 'all 0.15s',
              boxShadow: activeCategory === cat ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* ══════════ My Communities ══════════ */}
      {isAuthenticated && myCommunities.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#6366f1" /> Your Community Chats
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myCommunities.map(c => (
              <div key={c.id} onClick={() => router.push(`/communities/${c.id}`)} style={{
                background: '#fff', borderRadius: '16px', padding: '16px',
                border: '1px solid #f0f1f5', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}
              >
                 <div style={{
                  width: '56px', height: '56px', borderRadius: '14px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                  background: `linear-gradient(135deg, ${c.color || '#6366f1'}22, ${c.color || '#4f46e5'}44)`, flexShrink: 0,
                }}>{c.icon || c.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>{c.name}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>{c._count?.posts || 0} active posts • {c._count?.members || c.memberCount || 0} members</p>
                </div>
                <div style={{
                   width: '36px', height: '36px', borderRadius: '50%', background: '#f8f9fc',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1'
                }}>
                  <ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ Suggested Communities ══════════ */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>Discover Communities</h2>
          <Link href="#" style={{ fontSize: '13px', fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>See All</Link>
        </div>
        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }}>
          {communities.filter(c => !joinedCommunities.has(c.id)).map((c) => {
            return (
              <div key={c.id} onClick={() => router.push(`/communities/${c.id}`)} style={{
                minWidth: '210px', maxWidth: '240px', background: '#fff', borderRadius: '18px', padding: '22px 18px',
                border: '1px solid #e5e7ee', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                flexShrink: 0, display: 'flex', flexDirection: 'column',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              >
                <div style={{
                  width: '50px', height: '50px', borderRadius: '14px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                  background: `${c.color || '#6366f1'}12`, marginBottom: '14px',
                }}>{c.icon || c.name.charAt(0)}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }}>{c.name}</h3>
                <p style={{
                  fontSize: '12px', color: '#94a3b8', marginBottom: '16px', flex: 1, lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}>{c.desc || c.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.03em' }}>{c.members || c.memberCount || 0} MEMBERS</span>
                  <button
                    onClick={(e) => handleJoin(c.id, e)}
                    disabled={loadingAction === c.id}
                    style={{
                      padding: '7px 20px', borderRadius: '24px', fontSize: '12px', fontWeight: 600,
                      cursor: loadingAction === c.id ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif',
                      background: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      transition: 'all 0.15s',
                      opacity: loadingAction === c.id ? 0.7 : 1,
                    }}
                  >{loadingAction === c.id ? 'Wait...' : 'Join'}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════ Active Discussions ══════════ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>Active Discussions</h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {([] as any[]).map((disc, idx) => {
            const isLiked = likedPosts.has(disc.id);
            const isSaved = savedPosts.has(disc.id);
            return (
              <div key={disc.id} style={{
                background: '#fff', borderRadius: '18px', padding: '20px',
                border: '1px solid #f0f1f5', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'}
              >
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700,
                    background: avatarGradients[idx % avatarGradients.length],
                    color: '#fff', flexShrink: 0,
                  }}>{disc.avatar}</div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{disc.user}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {disc.from ? (
                        <><span style={{ color: '#94a3b8' }}>{disc.from} to </span></>
                      ) : (
                        <span>in </span>
                      )}
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>{disc.community}</span>
                      <span> • {disc.timeAgo}</span>
                    </p>
                  </div>
                </div>

                {/* Content */}
                <p style={{
                  fontSize: '14px', color: '#475569', lineHeight: '1.65',
                  marginBottom: disc.hasImage ? '14px' : '16px', whiteSpace: 'pre-line',
                }}>
                  {disc.text}
                </p>

                {/* Attached Image */}
                {disc.hasImage && disc.imageUrl && (
                  <div style={{
                    borderRadius: '14px', overflow: 'hidden', marginBottom: '16px',
                    height: '200px', position: 'relative',
                  }}>
                    <img src={disc.imageUrl} alt="" style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 40%)',
                    }} />
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <button
                      onClick={() => toggleLike(disc.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                        fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        color: isLiked ? '#ef4444' : '#94a3b8',
                        transition: 'color 0.15s',
                      }}
                    >
                      <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} />
                      {disc.likes + (isLiked ? 1 : 0)}
                    </button>
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                      fontWeight: 500, color: '#94a3b8', background: 'none', border: 'none',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>
                      <MessageSquare size={16} /> {disc.comments} new
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleSave(disc.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                        color: isSaved ? '#6366f1' : '#94a3b8', transition: 'color 0.15s',
                      }}
                    >
                      <Bookmark size={16} fill={isSaved ? '#6366f1' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════ Floating New Post FAB ══════════ */}
      <button 
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert('Please select a specific community to create a post!');
          }
        }}
        style={{
        position: 'fixed', bottom: 80, right: 20, width: 56, height: 56,
        borderRadius: '50%', background: '#6366f1', color: '#fff', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(99,102,241,0.4)', zIndex: 40,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(99,102,241,0.5)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
