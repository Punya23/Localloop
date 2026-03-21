'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Users, Plus, Shield, GraduationCap, Code, Heart,
  MessageSquare, Share2, Bookmark, SlidersHorizontal,
  Image as ImageIcon, Send, Smile,
} from 'lucide-react';

/* ── Demo Data ──────────────────────────────────────────── */

const demoCommunities = [
  { id: 'c1', name: 'PCU Students', desc: 'Connect with peers from Pune City University for study groups and exam prep.', members: '1.2K', icon: '🎓', color: '#6366f1' },
  { id: 'c2', name: 'Developers Hub', desc: 'Local tech meetups, hackathons, job opportunities, and project collaborations.', members: '850', icon: '💻', color: '#06b6d4' },
  { id: 'c3', name: 'Women Relocators', desc: 'Safe spaces and support networks for women moving to a new city.', members: '620', icon: '🛡️', color: '#ec4899' },
  { id: 'c4', name: 'Fitness & Outdoors', desc: 'Weekend treks, gym buddies, running groups, and healthy living tips.', members: '430', icon: '🏃', color: '#10b981' },
];

const demoDiscussions = [
  {
    id: 'd1', user: 'Rahul Sharma', avatar: 'R', community: 'Pune Movers', from: 'Mumbai', timeAgo: '2h ago',
    text: 'Anyone know the best shared cab services from Wakad to BKC for daily commute? Looking for something reliable.',
    likes: 24, comments: 12, hasImage: false, liked: false,
  },
  {
    id: 'd2', user: 'Ananya K.', avatar: 'A', community: 'Developers', from: '', timeAgo: '5h ago',
    text: 'React Meetup next Saturday!\nHosting a small get-together at Blue Tokai, Balewadi High Street. DM for invite link.',
    likes: 58, comments: 42, hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=300&fit=crop',
    liked: false,
  },
  {
    id: 'd3', user: 'Vikram Iyer', avatar: 'V', community: 'PCU Students', from: '', timeAgo: '8h ago',
    text: 'Does the library stay open until 10 PM during exam weeks or is it still 8 PM?',
    likes: 8, comments: 5, hasImage: false, liked: false,
  },
  {
    id: 'd4', user: 'Priya Menon', avatar: 'P', community: 'Women Relocators', from: 'Chennai', timeAgo: '12h ago',
    text: 'Just moved to Baner last week! Any recommendations for safe evening walking routes? Also looking for a gym with women-only hours.',
    likes: 35, comments: 18, hasImage: false, liked: false,
  },
];

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
  const [activeCategory, setActiveCategory] = useState('All Discoveries');
  const [communities, setCommunities] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.getCommunities().then((data) => {
      if (data?.length > 0) setCommunities(data);
    }).catch(() => {});
  }, []);

  const categories = ['All Discoveries', 'University', 'Tech', 'Relocation', 'Women Only'];

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSave = (id: string) => {
    setSavedPosts((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleJoin = (id: string) => {
    setJoinedCommunities((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
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

      {/* ══════════ Suggested Communities ══════════ */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>Suggested Communities</h2>
          <Link href="#" style={{ fontSize: '13px', fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>See All</Link>
        </div>
        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }}>
          {demoCommunities.map((c) => {
            const joined = joinedCommunities.has(c.id);
            return (
              <div key={c.id} style={{
                minWidth: '210px', background: '#fff', borderRadius: '18px', padding: '22px 18px',
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
                  background: `${c.color}12`, marginBottom: '14px',
                }}>{c.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }}>{c.name}</h3>
                <p style={{
                  fontSize: '12px', color: '#94a3b8', marginBottom: '16px', flex: 1, lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}>{c.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.03em' }}>{c.members} MEMBERS</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleJoin(c.id); }}
                    style={{
                      padding: '7px 20px', borderRadius: '24px', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      background: joined ? '#f0f1f5' : '#6366f1',
                      color: joined ? '#64748b' : '#fff',
                      border: joined ? '1px solid #e5e7ee' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >{joined ? 'Joined' : 'Join'}</button>
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
          {demoDiscussions.map((disc, idx) => {
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
      <button style={{
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
