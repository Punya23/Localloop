'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  Building2, Users, Calendar, ArrowRight, TrendingUp,
  Home, Heart, ChevronRight, MapPin, Pencil, Sparkles,
  ThumbsUp, MessageSquare, Share2, Plus, CheckCircle2,
  Mountain, Coffee, Star, Shield, Zap, Clock,
} from 'lucide-react';

/* ── Demo Data ───────────────────────────────────────────── */


const recommendedCards = [
  {
    id: 'r1',
    icon: Building2,
    title: 'Best PGs under ₹10k',
    subtitle: 'Found 12 matching properties',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  },
  {
    id: 'r2',
    icon: Users,
    title: 'Join May Movers',
    subtitle: '45 people moving with you',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    id: 'r3',
    icon: Heart,
    title: '3 alumni nearby',
    subtitle: 'Working at Infosys & Wipro',
    gradient: 'linear-gradient(135deg, #818cf8, #6366f1)',
  },
];

const trendingHousing = [
  {
    id: 't1', title: 'Skyline Residency', area: 'Phase 1, Hinjewadi', rent: 18500,
    badge: 'VERIFIED', badgeColor: '#6366f1', type: '1 BHK',
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop',
  },
  {
    id: 't2', title: 'Green Terrace PG', area: 'Marunji, Hinjewadi', rent: 9000,
    badge: 'WOMEN SAFE', badgeColor: '#10b981', type: 'Twin Sharing',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop',
  },
  {
    id: 't3', title: 'Urban Nest Studio', area: 'Balewadi', rent: 20000,
    badge: 'SUPERHOST', badgeColor: '#f59e0b', type: 'Studio',
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop',
  },
  {
    id: 't4', title: 'Orchid PG', area: 'Baner', rent: 8500,
    badge: 'NEW LISTING', badgeColor: '#06b6d4', type: 'Triple Sharing',
    img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=300&fit=crop',
  },
];

const localMeetups = [
  { id: 'm1', month: 'MAR', day: '25', title: 'Newcomer Mixer', venue: 'Blue Ridge Café', time: '6:00 PM', attendees: 28 },
  { id: 'm2', month: 'MAR', day: '28', title: 'Techies Who Trek', venue: 'Sinhagad Fort', time: '5:00 AM', attendees: 15 },
  { id: 'm3', month: 'APR', day: '02', title: 'Women in Tech', venue: 'Koregaon Park Hub', time: '4:00 PM', attendees: 42 },
];

const localityScores = [
  { label: 'Safety', score: 85, color: '#10b981' },
  { label: 'Connectivity', score: 72, color: '#6366f1' },
  { label: 'Food Options', score: 90, color: '#f59e0b' },
  { label: 'Nightlife', score: 58, color: '#ec4899' },
];

const communityFeed = [
  {
    id: 'f1', user: 'Rahul Verma', role: 'Software Engineer @ TCS', timeAgo: '2h ago',
    avatar: 'R', community: 'Pune Movers',
    text: "Anyone moved to Phase 3 recently? How's the traffic during the rains? Thinking of taking a flat near Megapolis. 🌧️",
    likes: 24, comments: 8,
  },
  {
    id: 'f2', user: 'Sneha Kapur', role: 'UX Designer', timeAgo: '5h ago',
    avatar: 'S', community: 'Food Lovers',
    text: 'Found an amazing Tiffin service near Phase 1. Healthy, home-cooked, and super affordable. Check out "Mom\'s Kitchen". 🍲',
    likes: 156, comments: 42,
  },
  {
    id: 'f3', user: 'Aditya Kale', role: 'Product Manager @ Infosys', timeAgo: '1d ago',
    avatar: 'A', community: 'IT Hub Workers',
    text: 'Pro tip: The 7:45 AM shuttle from Wakad to IT Park avoids all traffic. Been using it for 3 months now. Game changer! 🚌',
    likes: 89, comments: 23,
  },
];

const rentTrendData = [
  { month: 'Oct', rent: 12200 },
  { month: 'Nov', rent: 12500 },
  { month: 'Dec', rent: 12100 },
  { month: 'Jan', rent: 12800 },
  { month: 'Feb', rent: 13000 },
  { month: 'Mar', rent: 13200 },
];

const avatarGradients = [
  'linear-gradient(135deg, #c4b5fd, #a78bfa)',
  'linear-gradient(135deg, #6ee7b7, #34d399)',
  'linear-gradient(135deg, #93c5fd, #60a5fa)',
  'linear-gradient(135deg, #fca5a5, #f87171)',
];

/* ── Mini Sparkline Chart (SVG) ──────────────────────────── */

function MiniChart({ data }: { data: { month: string; rent: number }[] }) {
  const min = Math.min(...data.map(d => d.rent)) - 500;
  const max = Math.max(...data.map(d => d.rent)) + 500;
  const w = 220;
  const h = 90;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((d.rent - min) / (max - min)) * h,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '90px' }}>
      <defs>
        <linearGradient id="chartGradDash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGradDash)" />
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#fff" stroke="#6366f1" strokeWidth={2} />
      ))}
    </svg>
  );
}

/* ── Dashboard Component ─────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.getDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const toggleLike = (id: string) => {
    setLikedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const userName = (user?.name || 'Punya').split(' ')[0];
  const userArea = user?.preferredArea || 'Hinjewadi';
  const moveMonth = user?.moveMonth || 'May';

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ height: '32px', width: '300px', borderRadius: '12px', background: '#f0f1f5', animation: 'pulse 1.5s infinite', marginBottom: '32px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: '140px', borderRadius: '16px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px' }}>
          <div>
            {[1, 2].map(i => <div key={i} style={{ height: '200px', borderRadius: '16px', background: '#f0f1f5', animation: 'pulse 1.5s infinite', marginBottom: '16px' }} />)}
          </div>
          <div>
            {[1, 2, 3].map(i => <div key={i} style={{ height: '120px', borderRadius: '16px', background: '#f0f1f5', animation: 'pulse 1.5s infinite', marginBottom: '16px' }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px 100px', maxWidth: '1200px' }}>

      {/* ═══════════ Welcome Section ═══════════ */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#1a1a2e', marginBottom: '10px' }}>
          Welcome {userName} 👋
        </h1>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '8px 18px', borderRadius: '12px', background: '#fff',
          border: '1px solid #e5e7ee', fontSize: '13px', color: '#475569',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <Calendar size={14} style={{ color: '#6366f1' }} />
          <span>Moving in <strong style={{ color: '#6366f1' }}>{moveMonth}</strong> to <strong style={{ color: '#1a1a2e' }}>{userArea}</strong></span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
            <Pencil size={12} />
          </button>
        </div>
      </div>

      {/* ═══════════ Main Grid: Content + Sidebar ═══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* ═══ Recommended For You ═══ */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>Recommended for You</h2>
              <Link href="#" style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', fontWeight: 600, color: '#6366f1', textDecoration: 'none',
              }}>
                <Sparkles size={14} /> AI Insights
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {recommendedCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.id} style={{
                    background: card.gradient, borderRadius: '18px', padding: '24px 20px',
                    color: '#fff', cursor: 'pointer', transition: 'all 0.25s',
                    minHeight: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '13px',
                      background: 'rgba(255,255,255,0.2)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                      backdropFilter: 'blur(4px)',
                    }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{card.title}</h3>
                      <p style={{ fontSize: '12px', opacity: 0.85 }}>{card.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ Trending Housing ═══ */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>Trending Housing</h2>
              <Link href="/housing" style={{
                fontSize: '13px', fontWeight: 600, color: '#6366f1', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
              {trendingHousing.map((h) => (
                <Link key={h.id} href={`/housing/${h.id}`} style={{
                  minWidth: '260px', background: '#fff', borderRadius: '18px', overflow: 'hidden',
                  border: '1px solid #e5e7ee', textDecoration: 'none', color: '#1a1a2e',
                  transition: 'all 0.25s', flexShrink: 0,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{
                    height: '165px', backgroundImage: `url(${h.img})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px',
                      padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                      background: h.badgeColor, color: '#fff', textTransform: 'uppercase',
                      letterSpacing: '0.04em', backdropFilter: 'blur(4px)',
                    }}>{h.badge}</div>
                    <div style={{
                      position: 'absolute', bottom: '10px', left: '10px',
                      background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 6,
                      fontSize: 11, color: '#fff', backdropFilter: 'blur(4px)',
                    }}>{h.area}</div>
                  </div>
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{h.title}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{h.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#6366f1' }}>
                        ₹{h.rent.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>/mo</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ═══ Community Feed ═══ */}
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #e5e7ee',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>Community Feed</h2>
              <Link href="/communities" style={{
                fontSize: '13px', fontWeight: 600, color: '#6366f1', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                Join Discussions <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {communityFeed.map((post, idx) => {
                const isLiked = likedPosts.has(post.id);
                return (
                  <div key={post.id} style={{
                    background: '#fff', borderRadius: '18px', padding: '22px',
                    border: '1px solid #f0f1f5', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'}
                  >
                    {/* Author */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700,
                        background: avatarGradients[idx % avatarGradients.length],
                        color: '#fff', flexShrink: 0,
                      }}>{post.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{post.user}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                          in <span style={{ color: '#6366f1', fontWeight: 500 }}>{post.community}</span> • {post.timeAgo}
                        </p>
                      </div>
                    </div>
                    {/* Text */}
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.65', marginBottom: '16px' }}>
                      {post.text}
                    </p>
                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <button
                        onClick={() => toggleLike(post.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500,
                          color: isLiked ? '#ef4444' : '#94a3b8',
                          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                          transition: 'color 0.15s',
                        }}
                      >
                        <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} />
                        {post.likes + (isLiked ? 1 : 0)}
                      </button>
                      <button style={{
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500,
                        color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}>
                        <MessageSquare size={16} /> {post.comments} Comments
                      </button>
                      <button style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', marginLeft: 'auto',
                      }}>
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ═══ Rent Trends ═══ */}
          <div style={{
            background: '#fff', borderRadius: '18px', padding: '22px',
            border: '1px solid #e5e7ee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <TrendingUp size={16} style={{ color: '#6366f1' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>Rent Trends</h3>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
              {userArea} Phase 1 • Last 6 Months
            </p>
            <MiniChart data={rentTrendData} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AVG. RENT</p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a2e' }}>₹13.2k</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: '#10b981',
                  background: 'rgba(16,185,129,0.08)', padding: '4px 10px', borderRadius: '8px',
                }}>+12% YOY</span>
                <p style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '6px' }}>
                  ⚡ High Demand
                </p>
              </div>
            </div>
          </div>

          {/* ═══ Local Meetups ═══ */}
          <div style={{
            background: '#fff', borderRadius: '18px', padding: '22px',
            border: '1px solid #e5e7ee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} style={{ color: '#6366f1' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>Local Meetups</h3>
              </div>
              <Link href="/events" style={{ color: '#6366f1', textDecoration: 'none', display: 'flex' }}>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {localMeetups.map((m) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 14px', borderRadius: '14px', background: '#f8f9fc',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f1f5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8f9fc'}
                >
                  {/* Date Box */}
                  <div style={{
                    width: '50px', height: '52px', borderRadius: '12px', background: '#fff',
                    border: '1px solid #e5e7ee', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.month}</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>{m.day}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '3px' }}>{m.title}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>{m.venue} • {m.time}</p>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: '#6366f1',
                    background: 'rgba(99,102,241,0.08)', padding: '3px 8px',
                    borderRadius: 8, whiteSpace: 'nowrap',
                  }}>
                    {m.attendees} going
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ Locality Score ═══ */}
          <div style={{
            background: '#fff', borderRadius: '18px', padding: '22px',
            border: '1px solid #e5e7ee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>Locality Score</h3>
              <span style={{
                fontSize: 10, fontWeight: 600, color: '#94a3b8', marginLeft: 'auto',
              }}>{userArea}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {localityScores.map((s) => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '7px' }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color, fontSize: 12 }}>{s.score}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#f0f1f5', overflow: 'hidden' }}>
                    <div style={{
                      width: `${s.score}%`, height: '100%', borderRadius: '4px',
                      background: s.color, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ Quick Actions ═══ */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fc, #e8eaff)',
            borderRadius: '18px', padding: '22px',
            border: '1px solid #e5e7ee',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '14px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: Building2, label: 'Browse Housing', href: '/housing', color: '#6366f1' },
                { icon: Users, label: 'Find Communities', href: '/communities', color: '#10b981' },
                { icon: Shield, label: 'Women-Only Mode', href: '/women-only', color: '#ec4899' },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link key={action.label} href={action.href} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 12, background: '#fff', textDecoration: 'none',
                    color: '#1a1a2e', transition: 'all 0.15s', border: '1px solid #e5e7ee',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.boxShadow = `0 2px 8px ${action.color}20`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7ee'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: `${action.color}10`,
                    }}>
                      <ActionIcon size={16} style={{ color: action.color }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{action.label}</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#94a3b8' }} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ FAB Button ═══════════ */}
      <button
        style={{
          position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px',
          borderRadius: '50%', background: 'linear-gradient(135deg, #1a1a2e, #2d2d4e)',
          color: '#fff', border: 'none', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(26,26,46,0.35)', zIndex: 40,
          transition: 'all 0.25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(26,26,46,0.45)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(26,26,46,0.35)'; }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
