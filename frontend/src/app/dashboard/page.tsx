'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { api } from '@/lib/api';
import {
  Building2, Users, Calendar, ArrowRight, TrendingUp,
  Home, Heart, ChevronRight, MapPin, Pencil, Sparkles,
  ThumbsUp, MessageSquare, Share2, Plus, CheckCircle2,
  Mountain, Coffee, Star, Shield, Zap, Clock,
} from 'lucide-react';

/* ── Demo Data ───────────────────────────────────────────── */



const localityScores = [
  { label: 'Safety', score: 85, color: 'var(--success)' },
  { label: 'Connectivity', score: 72, color: 'var(--primary)' },
  { label: 'Food Options', score: 90, color: 'var(--warning)' },
  { label: 'Nightlife', score: 58, color: '#ec4899' },
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
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGradDash)" />
      <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#fff" stroke="var(--primary)" strokeWidth={2} />
      ))}
    </svg>
  );
}

/* ── Dashboard Component ─────────────────────────────────── */

export default function DashboardPage() {
  const { user, isReady } = useAuthGuard({ requireOnboarded: true });
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isReady && user) {
      api.getDashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
    }
  }, [isReady, user]);

  const toggleLike = (id: string) => {
    setLikedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  if (!isReady || !user) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ height: '32px', width: '300px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite', marginBottom: '32px' }} />
      </div>
    );
  }

  const userName = (user?.name || 'User').split(' ')[0].toUpperCase();
  const userArea = user?.preferredArea || 'Hinjewadi';
  const moveMonth = user?.moveMonth || 'May';

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ height: '32px', width: '300px', borderRadius: '12px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite', marginBottom: '32px' }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => <div key={i} style={{ height: '140px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-7">
          <div>
            {[1, 2].map(i => <div key={i} style={{ height: '200px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite', marginBottom: '16px' }} />)}
          </div>
          <div>
            {[1, 2, 3].map(i => <div key={i} style={{ height: '120px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite', marginBottom: '16px' }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-32 max-w-[1200px] mx-auto w-full">

      {/* ═══════════ Welcome Section ═══════════ */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Welcome {userName} 👋
        </h1>
        <Link href="/profile" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '8px 18px', borderRadius: '12px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', textDecoration: 'none',
        }}>
          <Calendar size={14} style={{ color: 'var(--primary)' }} />
          <span>Moving in <strong style={{ color: 'var(--primary)' }}>{moveMonth}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{userArea}</strong></span>
          <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
            <Pencil size={12} />
          </span>
        </Link>
      </div>

      {/* ═══════════ Main Grid: Content + Sidebar ═══════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">

        {/* ── LEFT COLUMN ── */}
        <div className="min-w-0">

          {/* ═══ Recommended For You ═══ */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Recommended for You</h2>
              <button onClick={(e) => {
                e.preventDefault();
                const prompt = `Can you provide some personalized AI Insights for me? I am looking to move to ${userArea} around ${moveMonth} with a budget up to ₹${(user?.budgetMax || 15000)}. What are your top recommendations?`;
                window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { initialPrompt: prompt } }));
              }} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0
              }}>
                <Sparkles size={14} /> AI Insights
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'r1',
                  icon: Building2,
                  title: `Best PGs under ₹${(user?.budgetMax || 15000) / 1000}k`,
                  subtitle: `Found ${data?.cityStats?.totalListings || 0} matching properties`,
                  gradient: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  href: '/housing',
                },
                {
                  id: 'r2',
                  icon: Users,
                  title: `Join ${user?.moveMonth || 'Next'} Movers`,
                  subtitle: `${data?.insights?.movingWithYou || 0} people moving with you`,
                  gradient: 'linear-gradient(135deg, var(--success), #059669)',
                  href: '/communities',
                },
                {
                  id: 'r3',
                  icon: Heart,
                  title: `${data?.insights?.nearbyAlumni || 0} alumni nearby`,
                  subtitle: `From ${(user as any)?.university || (user as any)?.company || 'your network'}`,
                  gradient: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                  href: '/people',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.id} href={card.href} style={{
                    background: card.gradient, borderRadius: '18px', padding: '24px 20px',
                    color: '#fff', cursor: 'pointer', transition: 'all 0.25s',
                    minHeight: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textDecoration: 'none'
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
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ═══ Trending Housing ═══ */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Trending Housing</h2>
              <Link href="/housing" style={{
                fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
              {data?.recommendedHousing?.map((h: any) => (
                <Link key={h.id} href={`/housing/${h.id}`} style={{
                  minWidth: '260px', background: 'var(--bg-card)', borderRadius: '18px', overflow: 'hidden',
                  border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-primary)',
                  transition: 'all 0.25s', flexShrink: 0,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{
                    height: '165px', backgroundImage: `url(${(h.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop')})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px',
                      padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                      background: (h.isWomenFriendly ? 'var(--success)' : 'var(--primary)'), color: '#fff', textTransform: 'uppercase',
                      letterSpacing: '0.04em', backdropFilter: 'blur(4px)',
                    }}>{(h.isWomenFriendly ? 'WOMEN SAFE' : 'VERIFIED')}</div>
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
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.type}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{h.rent.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/mo</span>
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
              marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border)',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Community Feed</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={(e) => {
                  e.preventDefault();
                  const prompt = `Can you summarize the latest discussions in the communities and tell me what the biggest topics are right now?`;
                  window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { initialPrompt: prompt } }));
                }} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '13px', fontWeight: 600, color: '#8b5cf6', textDecoration: 'none',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0
                }}>
                  <Sparkles size={14} /> AI Summary
                </button>
                <Link href="/communities" style={{
                  fontSize: '13px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  Join Discussions <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data?.recentPosts?.map((post: any, idx: number) => {
                const isLiked = likedPosts.has(post.id);
                return (
                  <div key={post.id} onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('a')) {
                        router.push(`/communities/${post.community?.id}`);
                      }
                    }} style={{
                    background: 'var(--bg-card)', borderRadius: '18px', padding: '22px',
                    border: '1px solid var(--border-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s', cursor: 'pointer',
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
                      }}>{post.user?.name?.charAt(0) || "U"}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{post.user?.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          in <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{post.community?.name}</span> • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Text */}
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '16px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {post.content}
                    </p>
                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <button
                        onClick={() => toggleLike(post.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500,
                          color: isLiked ? 'var(--danger)' : 'var(--text-muted)',
                          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                          transition: 'color 0.15s',
                        }}
                      >
                        <Heart size={16} fill={isLiked ? 'var(--danger)' : 'none'} />
                        {post.likesCount + (isLiked ? 1 : 0)}
                      </button>
                      <Link href={`/communities/${post.community?.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500,
                        color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'none'
                      }}>
                        <MessageSquare size={16} /> {post._count?.comments || 0} Comments
                      </Link>
                      <button style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: 'auto',
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
            background: 'var(--bg-card)', borderRadius: '18px', padding: '22px',
            border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Rent Trends</h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {userArea} Phase 1 • Last 6 Months
            </p>
            <MiniChart data={rentTrendData} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AVG. RENT</p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>₹13.2k</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: 'var(--success)',
                  background: 'rgba(16,185,129,0.08)', padding: '4px 10px', borderRadius: '8px',
                }}>+12% YOY</span>
                <p style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600, marginTop: '6px' }}>
                  ⚡ High Demand
                </p>
              </div>
            </div>
          </div>

          {/* ═══ Local Meetups ═══ */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: '18px', padding: '22px',
            border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Local Meetups</h3>
              </div>
              <Link href="/events" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex' }}>
                <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data?.upcomingEvents?.map((m: any) => { 
 const d = new Date(m.date);
 return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 14px', borderRadius: '14px', background: 'var(--bg-primary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--border-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-primary)'}
                >
                  {/* Date Box */}
                  <div style={{
                    width: '50px', height: '52px', borderRadius: '12px', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.toLocaleString("en-US", {month: "short"}).toUpperCase()}</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{d.getDate()}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>{m.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.location} • {d.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</p>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--primary)',
                    background: 'rgba(99,102,241,0.08)', padding: '3px 8px',
                    borderRadius: 8, whiteSpace: 'nowrap',
                  }}>
                    {(m._count?.attendees || 0)} going
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* ═══ Locality Score ═══ */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: '18px', padding: '22px',
            border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Locality Score</h3>
              <span style={{
                fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 'auto',
              }}>{userArea}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {localityScores.map((s) => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '7px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color, fontSize: 12 }}>{s.score}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border-light)', overflow: 'hidden' }}>
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
            background: 'linear-gradient(135deg, var(--bg-primary), #e8eaff)',
            borderRadius: '18px', padding: '22px',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: Building2, label: 'Browse Housing', href: '/housing', color: 'var(--primary)' },
                { icon: Users, label: 'Find Communities', href: '/communities', color: 'var(--success)' },
                { icon: Shield, label: 'Women-Only Mode', href: '/women-only', color: '#ec4899' },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link key={action.label} href={action.href} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 12, background: 'var(--bg-card)', textDecoration: 'none',
                    color: 'var(--text-primary)', transition: 'all 0.15s', border: '1px solid var(--border)',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.boxShadow = `0 2px 8px ${action.color}20`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: `${action.color}10`,
                    }}>
                      <ActionIcon size={16} style={{ color: action.color }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{action.label}</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ FAB Button ═══════════ */}
      <button
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/communities';
          }
        }}
        style={{
          position: 'fixed', bottom: 84, right: 20, width: 56, height: 56,
          borderRadius: '50%', background: 'linear-gradient(135deg, var(--text-primary), #2d2d4e)',
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
