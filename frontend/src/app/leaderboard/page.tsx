'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trophy, Medal, Star, Crown, TrendingUp } from 'lucide-react';

const levelColors: Record<string, string> = {
  EXPLORER: '#94a3b8', GUIDE: '#06b6d4', SETTLER: '#10b981',
  CITY_NAVIGATOR: '#f59e0b', LOCAL_MENTOR: '#6366f1',
};
const levelIcons: Record<string, any> = {
  EXPLORER: Star, GUIDE: TrendingUp, SETTLER: Medal,
  CITY_NAVIGATOR: Trophy, LOCAL_MENTOR: Crown,
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard().then(setLeaderboard).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2"><Trophy size={24} style={{ color: 'var(--warning)' }} /> Leaderboard</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Top contributors helping newcomers settle in</p>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
            const rank = [2, 1, 3][i];
            const color = rank === 1 ? '#fbbf24' : rank === 2 ? '#c0c0c0' : '#cd7f32';
            return (
              <div key={entry?.userId} className={`glass-card p-5 text-center ${rank === 1 ? 'scale-105' : ''}`}
                   style={{ transform: rank === 1 ? 'scale(1.05)' : 'none' }}>
                <div className="text-2xl mb-2">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2"
                     style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }}>
                  {entry?.user?.name?.charAt(0)}
                </div>
                <p className="font-semibold text-sm truncate">{entry?.user?.name}</p>
                <p className="text-2xl font-bold gradient-text">{entry?.points}</p>
                <p className="text-xs mt-1" style={{ color: levelColors[entry?.level] || 'var(--text-muted)' }}>{entry?.level?.replace('_', ' ')}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      {loading ? (
        <div className="flex flex-col gap-3">{[1,2,3,4,5].map((i) => <div key={i} className="shimmer h-16 rounded-xl" />)}</div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Trophy size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No reputation data yet. Start contributing!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leaderboard.map((entry) => {
            const LevelIcon = levelIcons[entry.level] || Star;
            const color = levelColors[entry.level] || '#94a3b8';
            return (
              <div key={entry.userId} className="glass-card p-4 flex items-center gap-4 hover-lift">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                     style={{ background: entry.rank <= 3 ? 'var(--primary)' : 'var(--bg-card)', color: entry.rank <= 3 ? 'white' : 'var(--text-muted)' }}>
                  {entry.rank}
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                     style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {entry.user?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{entry.user?.name}</p>
                  <div className="flex items-center gap-1 text-xs" style={{ color }}>
                    <LevelIcon size={12} /> {entry.level?.replace('_', ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold gradient-text">{entry.points}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
