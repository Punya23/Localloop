'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { MapPin, Star, ArrowRight, Save, Camera, Bookmark, Pencil, Award, TrendingUp, Calendar, Heart, MessageSquare } from 'lucide-react';

import { useRouter } from 'next/navigation';

/* ── Star Rating Component ──────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= Math.floor(rating) ? 'var(--warning)' : star === Math.ceil(rating) && rating % 1 !== 0 ? 'var(--warning)' : 'none'}
          style={{ color: star <= rating ? 'var(--warning)' : 'var(--border)' }}
        />
      ))}
    </div>
  );
}

/* ── Profile Page ─────────────────────────────────────── */

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', city: '', preferredArea: '' });
  const [activeTab, setActiveTab] = useState('Posts');

  useEffect(() => {
    api.getProfile().then((p) => {
      setProfile(p);
      setEditForm({ name: p.name || '', bio: p.bio || '', city: p.city || '', preferredArea: p.preferredArea || '' });
    }).catch(() => {
      setProfile({
        name: user?.name || 'Punya',
        city: user?.city || 'Pune',
        reputation: user?.reputation || { points: 450, level: 'EXPLORER' },
      });
    }).finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    try {
      const updated = await api.updateProfile(editForm);
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
    } catch { setEditing(false); }
  };

  if (loading) {
    return <div style={{ padding: '32px', maxWidth: '540px', margin: '0 auto' }}>
      <div style={{ height: '420px', borderRadius: '16px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
    </div>;
  }

  const p = profile || {};
  const points = p.reputation?.points || user?.reputation?.points || 450;
  const level = p.reputation?.level || user?.reputation?.level || 'EXPLORER';

  const levels: Record<string, { label: string; next: string; nextPts: number; ptsNeeded: number }> = {
    EXPLORER: { label: 'Explorer', next: 'Guide', nextPts: 200, ptsNeeded: 0 },
    GUIDE: { label: 'Guide', next: 'Settler', nextPts: 500, ptsNeeded: 200 },
    SETTLER: { label: 'Settler', next: 'Navigator', nextPts: 1000, ptsNeeded: 500 },
    CITY_NAVIGATOR: { label: 'Navigator', next: 'Mentor', nextPts: 2000, ptsNeeded: 1000 },
    LOCAL_MENTOR: { label: 'Mentor', next: 'Max', nextPts: 5000, ptsNeeded: 2000 },
  };

  const lvl = levels[level] || levels.EXPLORER;
  const progress = lvl.nextPts > lvl.ptsNeeded
    ? Math.min(100, ((points - lvl.ptsNeeded) / (lvl.nextPts - lvl.ptsNeeded)) * 100)
    : 100;

  const achievementBadges = [
    { label: 'First Review', icon: '⭐', earned: (p.housingReviews?.length > 0) },
    { label: '5 Connections', icon: '🤝', earned: (p.communities?.length >= 5) },
    { label: 'First Post', icon: '📝', earned: (p.posts?.length > 0) },
    { label: 'Community Leader', icon: '👑', earned: (points >= 1000) },
    { label: 'Top Contributor', icon: '🏆', earned: (points >= 2000) },
  ];

  const profileTabs = ['Posts', 'Reviews', 'Saved Items'];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 pb-28">

      {/* ══════════ Avatar + Identity ══════════ */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          {/* Gradient ring */}
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%', padding: '4px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent), var(--primary))',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: 700,
              background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: 'var(--primary)',
            }}>
              {(p.name || user?.name || 'P').charAt(0).toUpperCase()}
            </div>
          </div>
          {/* Camera button */}
          <button
            onClick={() => setEditing(!editing)}
            style={{
              position: 'absolute', bottom: '4px', right: '4px',
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--primary)', color: '#fff', border: '3px solid #fff',
              cursor: 'pointer', transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = ''}
          ><Camera size={14} /></button>
        </div>

        {/* Name */}
        {editing ? (
          <input
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            style={{
              display: 'block', width: '220px', margin: '0 auto 8px', textAlign: 'center',
              fontSize: '22px', fontWeight: 700, border: '2px solid var(--border)', borderRadius: '12px',
              padding: '8px 12px', outline: 'none', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        ) : (
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {p.name || user?.name || 'Punya'}
          </h1>
        )}

        {/* Location & Level */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontSize: '14px', color: 'var(--text-muted)',
        }}>
          <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
          <span>{p.city || user?.city || 'Pune'}</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{lvl.label}</span>
        </div>

        {/* Edit Form */}
        {editing && (
          <div style={{ marginTop: '20px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
            <textarea
              placeholder="Bio..."
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={2}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)',
                fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none',
                marginBottom: '10px', resize: 'none', background: 'var(--bg-primary)',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input placeholder="City" value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'var(--bg-primary)',
                }}
              />
              <input placeholder="Area" value={editForm.preferredArea}
                onChange={(e) => setEditForm({ ...editForm, preferredArea: e.target.value })}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border)',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', background: 'var(--bg-primary)',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => setEditing(false)} style={{
                padding: '9px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                background: 'var(--bg-card)', color: '#64748b', border: '1px solid var(--border)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>Cancel</button>
              <button onClick={handleSave} style={{
                padding: '9px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
                background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
              }}><Save size={14} /> Save</button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ Reputation Score Card ══════════ */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: '18px', padding: '22px', marginBottom: '20px',
        border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              REPUTATION SCORE
            </p>
            <p style={{ fontSize: '40px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{points}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Badge Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '24px',
                background: 'var(--primary)', color: '#fff',
              }}>{lvl.label}</span>
              <ArrowRight size={14} style={{ color: '#c4b5fd' }} />
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '24px',
                background: 'rgba(99,102,241,0.08)', color: 'var(--primary)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}>{lvl.next}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontWeight: 500 }}>Progress to {lvl.next}</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{
            width: '100%', height: '10px', borderRadius: '5px', background: 'var(--border)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%', borderRadius: '5px',
              background: 'linear-gradient(90deg, var(--primary), var(--accent))',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '8px', fontStyle: 'italic' }}>
            Next milestone: Voyager at {lvl.nextPts.toLocaleString()} pts
          </p>
        </div>
      </div>

      {/* ══════════ Achievement Badges ══════════ */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: '18px', padding: '18px 22px', marginBottom: '24px',
        border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Award size={16} style={{ color: 'var(--warning)' }} />
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Achievements</h3>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {achievementBadges.map((badge) => (
            <div key={badge.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              minWidth: 72, opacity: badge.earned ? 1 : 0.35,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20,
                background: badge.earned ? 'rgba(245,158,11,0.1)' : 'var(--border-light)',
                border: badge.earned ? '2px solid rgba(245,158,11,0.3)' : '2px solid transparent',
              }}>{badge.icon}</div>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#64748b', textAlign: 'center' }}>
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ Profile Tabs ══════════ */}
      <div style={{ display: 'flex', gap: '28px', borderBottom: '2px solid var(--border-light)', marginBottom: '24px' }}>
        {profileTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              paddingBottom: '14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none', fontFamily: 'Inter, sans-serif',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* ══════════ Posts Tab ══════════ */}
      {activeTab === 'Posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--bg-primary)', border: '1px dashed #c4b5fd', textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/communities')}>
             <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>+ Write a new Post / Blog in Communities</p>
          </div>
          {p.posts?.map((post: any) => (
            <div key={post.id} style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => router.push(`/communities/${post.community?.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>{post.community?.name || 'Community'}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{post.content}</p>
            </div>
          ))}
          {(!p.posts || p.posts.length === 0) && (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No posts yet.</p>
          )}
        </div>
      )}

      {/* ══════════ Reviews Tab ══════════ */}
      {activeTab === 'Reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--bg-primary)', border: '1px dashed #fcd34d', textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/housing')}>
             <p style={{ fontSize: '14px', color: 'var(--warning)', fontWeight: 600 }}>+ Review a PG / Accommodation</p>
          </div>
          {p.housingReviews?.map((review: any) => (
            <div key={review.id} style={{
              background: 'var(--bg-card)', borderRadius: 16, padding: '18px 20px',
              border: '1px solid var(--border-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }} onClick={() => router.push(`/housing/${review.housing?.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{review.housing?.title}</h4>
                <StarRating rating={review.rating} />
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{review.review}</p>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {(!p.housingReviews || p.housingReviews.length === 0) && (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No reviews yet.</p>
          )}
        </div>
      )}

      {/* ══════════ Saved Items Tab ══════════ */}
      {activeTab === 'Saved Items' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {p.savedHousings?.map((item: any) => (
            <div key={item.id} style={{
              display: 'flex', gap: 14, background: 'var(--bg-card)', borderRadius: 16, padding: 14,
              border: '1px solid var(--border-light)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onClick={() => router.push(`/housing/${item.housing?.id}`)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d4d6de'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
              <div style={{
                width: 80, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={item.housing?.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop'} alt={item.housing?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{item.housing?.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'var(--border-light)', color: '#64748b', fontWeight: 500 }}>{item.housing?.type?.replace('_', ' ')}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>₹{item.housing?.rent}/mo</span>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', alignSelf: 'center' }}>
                <Heart size={16} fill="var(--primary)" />
              </button>
            </div>
          ))}
          {(!p.savedHousings || p.savedHousings.length === 0) && (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No saved items.</p>
          )}
        </div>
      )}

      {/* ══════════ Floating Compose / Edit Button ══════════ */}
      <button className="lg:hidden" 
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/onboarding';
          }
        }}
        style={{
        position: 'fixed', bottom: 84, right: 20, width: 56, height: 56,
        borderRadius: '50%', background: 'var(--primary)', color: '#fff',
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.4)', zIndex: 40,
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = ''}
      >
        <Pencil size={20} />
      </button>

      {/* ── Gradient Shift Keyframes via style tag ── */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
