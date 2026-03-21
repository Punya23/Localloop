'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { User, MapPin, Building2, Star, Trophy, Calendar, Shield, Edit, Save } from 'lucide-react';

const levelProgress: Record<string, number> = {
  EXPLORER: 0, GUIDE: 50, SETTLER: 200, CITY_NAVIGATOR: 500, LOCAL_MENTOR: 1000,
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', city: '', preferredArea: '' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (isAuthenticated) {
      api.getProfile().then((p) => {
        setProfile(p);
        setEditForm({ name: p.name || '', bio: p.bio || '', city: p.city || '', preferredArea: p.preferredArea || '' });
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSave = async () => {
    try {
      const updated = await api.updateProfile(editForm);
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
    } catch (err: any) { alert(err.message); }
  };

  if (authLoading || loading) {
    return <div className="p-6 lg:p-8"><div className="shimmer h-96 rounded-xl max-w-2xl" /></div>;
  }

  const rep = profile?.reputation;
  const nextLevel = rep ? Object.entries(levelProgress).find(([, pts]) => pts > rep.points) : null;
  const progress = rep && nextLevel ? ((rep.points - (levelProgress[rep.level] || 0)) / (nextLevel[1] - (levelProgress[rep.level] || 0))) * 100 : 100;

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {/* Profile Header */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
                 style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <input className="input-field text-lg font-bold mb-1" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
              ) : (
                <h1 className="text-2xl font-bold">{profile?.name}</h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-primary">{profile?.role}</span>
                {profile?.isWomenMode && <span className="badge badge-danger"><Shield size={10} className="mr-1" />Women Mode</span>}
                {profile?.isMentor && <span className="badge badge-warning">Mentor</span>}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={14} /> {profile?.city || 'No city set'}
                {profile?.preferredArea && <span>· {profile.preferredArea}</span>}
              </div>
            </div>
            <button onClick={() => editing ? handleSave() : setEditing(true)}
                    className={editing ? 'btn-primary' : 'btn-secondary'} style={{ flexShrink: 0 }}>
              {editing ? <><Save size={16} className="mr-1" /> Save</> : <><Edit size={16} className="mr-1" /> Edit</>}
            </button>
          </div>

          {editing && (
            <div className="mt-4 grid gap-3">
              <textarea className="input-field text-sm" rows={2} placeholder="Bio..." value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field text-sm" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} />
                <input className="input-field text-sm" placeholder="Preferred Area" value={editForm.preferredArea} onChange={(e) => setEditForm({...editForm, preferredArea: e.target.value})} />
              </div>
            </div>
          )}

          {profile?.bio && !editing && <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>}
        </div>
      </div>

      {/* Reputation Card */}
      <div className="glass-card p-6 mb-6">
        <h2 className="font-semibold flex items-center gap-2 mb-4"><Trophy size={18} style={{ color: 'var(--warning)' }} /> Reputation</h2>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-3xl font-bold gradient-text">{rep?.points || 0}</span>
            <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>points</span>
          </div>
          <span className="badge badge-primary text-sm">{rep?.level?.replace('_', ' ') || 'Explorer'}</span>
        </div>
        {nextLevel && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              <span>{rep?.level?.replace('_', ' ')}</span>
              <span>{nextLevel[0].replace('_', ' ')}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', width: `${Math.min(100, progress)}%` }} />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{nextLevel[1] - (rep?.points || 0)} points to next level</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Building2, label: 'Listings', value: profile?._count?.housings || 0, color: '#6366f1' },
          { icon: Star, label: 'Reviews', value: profile?._count?.housingReviews || 0, color: '#f59e0b' },
          { icon: User, label: 'Posts', value: profile?._count?.posts || 0, color: '#06b6d4' },
          { icon: Calendar, label: 'Saved', value: profile?._count?.savedHousings || 0, color: '#10b981' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center hover-lift">
            <Icon size={20} className="mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Communities */}
      {profile?.communities?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">My Communities</h2>
          <div className="flex flex-col gap-2">
            {profile.communities.map((m: any) => (
              <div key={m.community?.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                     style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {m.community?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.community?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.community?.memberCount} members</p>
                </div>
                <span className="badge badge-accent text-xs">{m.community?.type?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Code */}
      {profile?.inviteCode && (
        <div className="glass-card p-5 mt-6 text-center">
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Your Invite Code</p>
          <p className="text-2xl font-bold gradient-text tracking-wider">{profile.inviteCode}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Share with friends to invite them</p>
        </div>
      )}
    </div>
  );
}
