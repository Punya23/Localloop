'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Users, Plus, Search, Shield, Lock, Globe, GraduationCap, Briefcase, MapPin, UserPlus } from 'lucide-react';

const typeIcons: Record<string, any> = {
  UNIVERSITY: GraduationCap, PROFESSIONAL: Briefcase, HOMETOWN: MapPin,
  NEWCOMER_BATCH: Users, WOMEN_ONLY: Shield, GENERAL: Globe,
};

const typeColors: Record<string, string> = {
  UNIVERSITY: '#6366f1', PROFESSIONAL: '#06b6d4', HOMETOWN: '#10b981',
  NEWCOMER_BATCH: '#f59e0b', WOMEN_ONLY: '#ec4899', GENERAL: '#8b5cf6',
};

export default function CommunitiesPage() {
  const { isAuthenticated } = useAuthStore();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [newComm, setNewComm] = useState({ name: '', description: '', type: 'GENERAL', isWomenOnly: false });

  useEffect(() => { fetchCommunities(); }, []);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const data = await api.getCommunities();
      setCommunities(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCommunity(newComm);
      setCreating(false);
      setNewComm({ name: '', description: '', type: 'GENERAL', isWomenOnly: false });
      fetchCommunities();
    } catch (err: any) { alert(err.message); }
  };

  const handleJoin = async (id: string) => {
    try {
      await api.joinCommunity(id);
      fetchCommunities();
    } catch (err: any) { alert(err.message); }
  };

  const filtered = search
    ? communities.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : communities;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users size={24} style={{ color: 'var(--accent)' }} /> Communities</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Connect with people in your area</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-10 text-sm" placeholder="Search communities..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isAuthenticated && (
            <button onClick={() => setCreating(!creating)} className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
              <Plus size={16} /> Create
            </button>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {creating && (
        <div className="glass-card p-6 mb-6">
          <h3 className="font-semibold mb-4">Create Community</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-field text-sm" placeholder="Community name" value={newComm.name} onChange={(e) => setNewComm({...newComm, name: e.target.value})} required />
            <select className="input-field text-sm" value={newComm.type} onChange={(e) => setNewComm({...newComm, type: e.target.value})} style={{ appearance: 'none' }}>
              <option value="GENERAL">General</option>
              <option value="UNIVERSITY">University</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="HOMETOWN">Hometown</option>
              <option value="NEWCOMER_BATCH">Newcomer Batch</option>
              <option value="WOMEN_ONLY">Women Only</option>
            </select>
            <textarea className="input-field text-sm md:col-span-2" rows={2} placeholder="Description..." value={newComm.description}
                      onChange={(e) => setNewComm({...newComm, description: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" className="btn-primary text-sm">Create Community</button>
            </div>
          </form>
        </div>
      )}

      {/* Communities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="shimmer h-44 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const Icon = typeIcons[c.type] || Globe;
            const color = typeColors[c.type] || '#8b5cf6';
            return (
              <div key={c.id} className="glass-card p-5 hover-lift flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="badge text-xs" style={{ background: `${color}15`, color }}>{c.type?.replace('_', ' ')}</span>
                      {c.isWomenOnly && <Shield size={12} style={{ color: '#ec4899' }} />}
                      {c.isPrivate && <Lock size={12} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  </div>
                </div>
                {c.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{c.description}</p>}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.memberCount || c._count?.members || 0} members · {c._count?.posts || 0} posts</span>
                  {c.isMember ? (
                    <Link href={`/communities/${c.id}`} className="btn-secondary text-xs py-1.5 px-3 no-underline">Open</Link>
                  ) : isAuthenticated ? (
                    <button onClick={() => handleJoin(c.id)} className="btn-accent text-xs py-1.5 px-3 flex items-center gap-1">
                      <UserPlus size={12} /> Join
                    </button>
                  ) : (
                    <Link href="/login" className="btn-secondary text-xs py-1.5 px-3 no-underline">Login to Join</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
