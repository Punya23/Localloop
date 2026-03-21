'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Calendar, MapPin, Users, Plus, Clock, ArrowRight } from 'lucide-react';

const typeColors: Record<string, string> = {
  MEETUP: '#6366f1', STUDY_GROUP: '#06b6d4', NETWORKING: '#10b981',
  CITY_EXPLORATION: '#f59e0b', WORKSHOP: '#ec4899', WELCOME: '#8b5cf6',
};

export default function EventsPage() {
  const { isAuthenticated } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'MEETUP', date: '', location: '', maxAttendees: '' });

  useEffect(() => { fetchEvents(); }, []);
  const fetchEvents = async () => {
    setLoading(true);
    try { const data = await api.getEvents(); setEvents(data); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEvent({ ...form, maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined });
      setCreating(false); setForm({ title: '', description: '', type: 'MEETUP', date: '', location: '', maxAttendees: '' });
      fetchEvents();
    } catch (err: any) { alert(err.message); }
  };

  const handleAttend = async (id: string) => {
    try { await api.attendEvent(id); fetchEvents(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar size={24} style={{ color: 'var(--success)' }} /> Events & Meetups</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Meet people, learn, and explore the city</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setCreating(!creating)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {creating && (
        <div className="glass-card p-6 mb-6">
          <h3 className="font-semibold mb-4">Create Event</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-field text-sm" placeholder="Event title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            <select className="input-field text-sm" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} style={{ appearance: 'none' }}>
              <option value="MEETUP">Meetup</option><option value="STUDY_GROUP">Study Group</option>
              <option value="NETWORKING">Networking</option><option value="CITY_EXPLORATION">City Exploration</option>
              <option value="WORKSHOP">Workshop</option><option value="WELCOME">Welcome</option>
            </select>
            <input type="datetime-local" className="input-field text-sm" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required />
            <input className="input-field text-sm" placeholder="Location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} required />
            <textarea className="input-field text-sm md:col-span-2" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required />
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" className="btn-primary text-sm">Create Event</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <div key={i} className="shimmer h-52 rounded-xl" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => {
            const color = typeColors[event.type] || '#6366f1';
            const eventDate = new Date(event.date);
            return (
              <div key={event.id} className="glass-card overflow-hidden hover-lift">
                <div className="h-2" style={{ background: color }} />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge text-xs" style={{ background: `${color}15`, color }}>{event.type?.replace('_', ' ')}</span>
                    {event.community && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>in {event.community.name}</span>}
                  </div>
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
                  <div className="flex flex-col gap-1.5 text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-2"><Clock size={12} /> {eventDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-2"><MapPin size={12} /> {event.location}</span>
                    <span className="flex items-center gap-2"><Users size={12} /> {event._count?.attendees || 0} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attending</span>
                  </div>
                  {isAuthenticated && (
                    <button onClick={() => handleAttend(event.id)} className="btn-primary text-xs w-full flex items-center justify-center gap-2">
                      Attend <ArrowRight size={14} />
                    </button>
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
