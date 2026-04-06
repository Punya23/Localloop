'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trophy, Medal, Star, Crown, TrendingUp, MapPin, Flame } from 'lucide-react';

/* ── Demo Data ──────────────────────────────────────────── */

const demoLeaderboard = [
  { rank: 1, userId: 'u1', user: { name: 'Arjun Mehta' }, points: 2450, level: 'LOCAL_MENTOR', city: 'Pune', streak: 14 },
  { rank: 2, userId: 'u2', user: { name: 'Sneha Kapur' }, points: 1820, level: 'CITY_NAVIGATOR', city: 'Pune', streak: 9 },
  { rank: 3, userId: 'u3', user: { name: 'Vikram Iyer' }, points: 1500, level: 'CITY_NAVIGATOR', city: 'Pune', streak: 7 },
  { rank: 4, userId: 'u4', user: { name: 'Priya Menon' }, points: 980, level: 'SETTLER', city: 'Pune', streak: 5 },
  { rank: 5, userId: 'u5', user: { name: 'Rahul Sharma' }, points: 720, level: 'GUIDE', city: 'Pune', streak: 3 },
  { rank: 6, userId: 'u6', user: { name: 'Ananya K.' }, points: 650, level: 'GUIDE', city: 'Pune', streak: 2 },
  { rank: 7, userId: 'u7', user: { name: 'Karthik Nair' }, points: 540, level: 'GUIDE', city: 'Pune', streak: 4 },
  { rank: 8, userId: 'u8', user: { name: 'Meera Joshi' }, points: 420, level: 'EXPLORER', city: 'Pune', streak: 1 },
  { rank: 9, userId: 'u9', user: { name: 'Aditya Kale' }, points: 380, level: 'EXPLORER', city: 'Pune', streak: 0 },
  { rank: 10, userId: 'u10', user: { name: 'Pooja Singh' }, points: 310, level: 'EXPLORER', city: 'Pune', streak: 2 },
];

const levelConfig: Record<string, { color: string; icon: any; label: string }> = {
  EXPLORER: { color: 'var(--text-muted)', icon: Star, label: 'Explorer' },
  GUIDE: { color: 'var(--accent)', icon: TrendingUp, label: 'Guide' },
  SETTLER: { color: 'var(--success)', icon: Medal, label: 'Settler' },
  CITY_NAVIGATOR: { color: 'var(--warning)', icon: Trophy, label: 'Navigator' },
  LOCAL_MENTOR: { color: 'var(--primary)', icon: Crown, label: 'Mentor' },
};

const podiumColors = ['#c0c0c0', '#fbbf24', '#cd7f32'];
const podiumEmojis = ['🥈', '🥇', '🥉'];

const avatarGradients = [
  'linear-gradient(135deg, #c4b5fd, #a78bfa)',
  'linear-gradient(135deg, #fde68a, #fbbf24)',
  'linear-gradient(135deg, #6ee7b7, #34d399)',
  'linear-gradient(135deg, #93c5fd, #60a5fa)',
  'linear-gradient(135deg, #fca5a5, #f87171)',
];

/* ── Leaderboard Page ─────────────────────────────────── */

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then((data) => { if (data?.length > 0) setLeaderboard(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = leaderboard.length > 0 ? leaderboard : demoLeaderboard;
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  // Reorder top 3 for podium: 2nd, 1st, 3rd
  const podium = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 24px 100px' }}>

      {/* ══════════ Header ══════════ */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        }}>
          <Trophy size={28} style={{ color: 'var(--warning)' }} />
          Leaderboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Top contributors helping newcomers settle in
        </p>
      </div>

      {/* ══════════ Top 3 Podium ══════════ */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '200px', borderRadius: '18px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : podium.length >= 3 ? (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr',
          gap: '14px', alignItems: 'flex-end', marginBottom: '32px',
        }}>
          {podium.map((entry, i) => {
            const rank = [2, 1, 3][i];
            const isFirst = rank === 1;
            const config = levelConfig[entry.level] || levelConfig.EXPLORER;
            return (
              <div key={entry.userId} style={{
                background: isFirst
                  ? 'linear-gradient(145deg, #fffbeb, #fef3c7)'
                  : '#fff',
                borderRadius: '18px', padding: isFirst ? '28px 16px' : '22px 14px',
                textAlign: 'center',
                border: isFirst ? '2px solid #fbbf24' : '1px solid var(--border)',
                boxShadow: isFirst ? '0 6px 24px rgba(251,191,36,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = ''}
              >
                <div style={{ fontSize: isFirst ? '32px' : '26px', marginBottom: '10px' }}>
                  {podiumEmojis[i]}
                </div>
                <div style={{
                  width: isFirst ? '64px' : '52px',
                  height: isFirst ? '64px' : '52px',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: isFirst ? '22px' : '18px', fontWeight: 700,
                  background: avatarGradients[i % avatarGradients.length],
                  color: '#fff', margin: '0 auto 10px',
                  border: isFirst ? '3px solid #fbbf24' : '2px solid var(--border)',
                }}>
                  {entry.user?.name?.charAt(0)}
                </div>
                <p style={{
                  fontSize: isFirst ? '15px' : '14px', fontWeight: 600,
                  color: 'var(--text-primary)', marginBottom: '4px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{entry.user?.name}</p>
                <p style={{
                  fontSize: isFirst ? '28px' : '22px', fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2, marginBottom: '4px',
                }}>{entry.points}</p>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  fontSize: '11px', fontWeight: 600, color: config.color,
                }}>
                  {React.createElement(config.icon, { size: 12 })}
                  {config.label}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ══════════ Full List ══════════ */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: '68px', borderRadius: '14px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', borderRadius: '18px', padding: '60px 24px',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <Trophy size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No reputation data yet
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Start contributing to earn your spot!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rest.map((entry, idx) => {
            const config = levelConfig[entry.level] || levelConfig.EXPLORER;
            const LevelIcon = config.icon;
            return (
              <div key={entry.userId} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 18px', borderRadius: '16px',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Rank */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, flexShrink: 0,
                  background: 'var(--bg-primary)', color: 'var(--text-muted)',
                }}>{entry.rank}</div>

                {/* Avatar */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 700,
                  background: avatarGradients[(idx + 3) % avatarGradients.length],
                  color: '#fff', flexShrink: 0,
                }}>{entry.user?.name?.charAt(0)}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {entry.user?.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 600, color: config.color,
                    }}>
                      <LevelIcon size={12} /> {config.label}
                    </span>
                    {entry.streak > 0 && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '3px',
                        fontSize: '10px', fontWeight: 600, color: 'var(--warning)',
                        background: 'rgba(245,158,11,0.08)', padding: '2px 7px',
                        borderRadius: '6px',
                      }}>
                        <Flame size={10} /> {entry.streak}d
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{
                    fontSize: '18px', fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>{entry.points}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
