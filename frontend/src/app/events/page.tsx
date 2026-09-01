'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  Calendar, MapPin, Users, Plus, Clock, ArrowRight, X,
  Sparkles, Mountain, Coffee, Laptop, PartyPopper, BookOpen,
} from 'lucide-react';

/* ── Demo Data ──────────────────────────────────────────── */

const typeConfig: Record<string, { color: string; icon: any; label: string }> = {
  MEETUP: { color: 'var(--primary)', icon: Coffee, label: 'Meetup' },
  STUDY_GROUP: { color: 'var(--accent)', icon: BookOpen, label: 'Study Group' },
  NETWORKING: { color: 'var(--success)', icon: Laptop, label: 'Networking' },
  CITY_EXPLORATION: { color: 'var(--warning)', icon: Mountain, label: 'City Exploration' },
  WORKSHOP: { color: '#ec4899', icon: Sparkles, label: 'Workshop' },
  WELCOME: { color: '#8b5cf6', icon: PartyPopper, label: 'Welcome' },
};

const demoEvents = [
  {
    id: 'e1', title: 'Newcomer Mixer: May Batch', description: 'Meet fellow May movers over coffee and snacks. Perfect for making your first friends in the city!',
    type: 'WELCOME', date: '2026-03-28T18:00:00', location: 'Blue Ridge Café, Hinjewadi',
    maxAttendees: 50, attendeeCount: 28, community: { name: 'Pune Movers' },
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=300&fit=crop',
  },
  {
    id: 'e2', title: 'Techies Who Trek: Sinhagad Fort', description: 'Early morning trek to the historic Sinhagad Fort. Carpool from Hinjewadi IT Park at 5 AM.',
    type: 'CITY_EXPLORATION', date: '2026-03-30T05:00:00', location: 'Sinhagad Fort, Pune',
    maxAttendees: 25, attendeeCount: 15, community: { name: 'Fitness & Outdoors' },
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&h=300&fit=crop',
  },
  {
    id: 'e3', title: 'React.js Workshop', description: 'Hands-on workshop covering React hooks, state management, and Next.js fundamentals. Bring your laptop!',
    type: 'WORKSHOP', date: '2026-04-05T14:00:00', location: 'CoWrks, Balewadi',
    maxAttendees: 30, attendeeCount: 22, community: { name: 'Developers Hub' },
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop',
  },
  {
    id: 'e4', title: 'Women in Tech: Coffee & Connect', description: 'Monthly meetup for women in tech. Share experiences, career advice, and build your professional network.',
    type: 'NETWORKING', date: '2026-04-08T16:00:00', location: 'Blue Tokai, Baner',
    maxAttendees: 40, attendeeCount: 35, community: { name: 'Women in Tech' },
    img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=500&h=300&fit=crop',
  },
  {
    id: 'e5', title: 'Study Group: DSA Prep', description: 'Weekly Data Structures & Algorithms study session. Currently covering graph algorithms and dynamic programming.',
    type: 'STUDY_GROUP', date: '2026-04-02T19:00:00', location: 'PCU Library, 3rd Floor',
    maxAttendees: 15, attendeeCount: 8, community: { name: 'PCU Students' },
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop',
  },
  {
    id: 'e6', title: 'Pune Food Walk: FC Road', description: 'Explore the legendary street food of FC Road. From vada pav to misal pav, taste the best of Pune!',
    type: 'MEETUP', date: '2026-04-12T17:30:00', location: 'FC Road, Deccan',
    maxAttendees: 20, attendeeCount: 18, community: { name: 'Food Lovers' },
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=300&fit=crop',
  },
];

/* ── Events Page ──────────────────────────────────────── */

export default function EventsPage() {
  const { isAuthenticated } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [attendedEvents, setAttendedEvents] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState('All');
  const [form, setForm] = useState({
    title: '', description: '', type: 'MEETUP', date: '', location: '', maxAttendees: '',
  });

  useEffect(() => {
    api.getEvents()
      .then((data) => { if (data?.length > 0) setEvents(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEvent({
        ...form,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
      });
      setCreating(false);
      setForm({ title: '', description: '', type: 'MEETUP', date: '', location: '', maxAttendees: '' });
    } catch (err: any) { alert(err.message); }
  };

  const handleAttend = (id: string) => {
    setAttendedEvents((prev) => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
    });
    api.attendEvent(id).catch(() => {});
  };

  const allEvents = events.length > 0 ? events : demoEvents;
  const filters = ['All', 'Meetup', 'Workshop', 'Networking', 'Trek', 'Study'];

  const filteredEvents = activeFilter === 'All'
    ? allEvents
    : allEvents.filter((ev) => {
        const type = (ev.type || '').toLowerCase();
        const filter = activeFilter.toLowerCase();
        return type.includes(filter) || (filter === 'trek' && type === 'city_exploration');
      });

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-6 py-6 pb-28">

      {/* ══════════ Header ══════════ */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '24px', gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <Calendar size={26} style={{ color: 'var(--primary)' }} />
            Events & Meetups
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Meet people, learn new skills, and explore the city together
          </p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setCreating(!creating)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px',
            borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', border: 'none',
            background: 'var(--primary)', color: '#fff',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)', transition: 'all 0.2s',
          }}>
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {/* ══════════ Filter Pills ══════════ */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '24px',
        overflowX: 'auto', paddingBottom: '4px',
      }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)} style={{
            padding: '8px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: 500,
            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
            border: activeFilter === f ? 'none' : '1px solid var(--border)',
            background: activeFilter === f ? 'var(--primary)' : '#fff',
            color: activeFilter === f ? '#fff' : '#64748b',
            transition: 'all 0.15s',
            boxShadow: activeFilter === f ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
          }}>{f}</button>
        ))}
      </div>

      {/* ══════════ Create Event Form ══════════ */}
      {creating && (
        <div style={{
          background: 'var(--bg-card)', borderRadius: '18px', padding: '24px',
          border: '1px solid var(--border)', marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Create Event</h3>
            <button onClick={() => setCreating(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
            }}><X size={20} /></button>
          </div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <input placeholder="Event title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={{
                  padding: '11px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                  background: 'var(--bg-primary)', fontSize: '14px', outline: 'none',
                  fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)',
                }}
              />
              <select value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{
                  padding: '11px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                  background: 'var(--bg-primary)', fontSize: '14px', outline: 'none',
                  fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', appearance: 'none' as const,
                }}
              >
                {Object.entries(typeConfig).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <input type="datetime-local" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                style={{
                  padding: '11px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                  background: 'var(--bg-primary)', fontSize: '14px', outline: 'none',
                  fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)',
                }}
              />
              <input placeholder="Location" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                style={{
                  padding: '11px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                  background: 'var(--bg-primary)', fontSize: '14px', outline: 'none',
                  fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)',
                }}
              />
              <textarea placeholder="Description" value={form.description} rows={2}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                style={{
                  gridColumn: '1 / -1', padding: '11px 16px', borderRadius: '12px',
                  border: '1px solid var(--border)', background: 'var(--bg-primary)', fontSize: '14px',
                  outline: 'none', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)',
                  resize: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button type="button" onClick={() => setCreating(false)} style={{
                padding: '10px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                background: 'var(--bg-card)', color: '#64748b', border: '1px solid var(--border)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>Cancel</button>
              <button type="submit" style={{
                padding: '10px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                background: 'var(--primary)', color: '#fff', border: 'none',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>Create Event</button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════ Events Grid ══════════ */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '320px', borderRadius: '18px', background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredEvents.map((event) => {
            const config = typeConfig[event.type] || typeConfig.MEETUP;
            const EventIcon = config.icon;
            const eventDate = new Date(event.date);
            const isAttended = attendedEvents.has(event.id);
            const count = (event.attendeeCount || event._count?.attendees || 0) + (isAttended ? 1 : 0);
            const isFull = event.maxAttendees && count >= event.maxAttendees;
            const spotsLeft = event.maxAttendees ? event.maxAttendees - count : null;

            return (
              <div key={event.id} style={{
                background: 'var(--bg-card)', borderRadius: '18px', overflow: 'hidden',
                border: '1px solid var(--border)', transition: 'all 0.25s',
                display: 'flex', flexDirection: 'column',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Image */}
                {event.img && (
                  <div style={{
                    height: '160px', backgroundImage: `url(${event.img})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
                    }} />
                    {/* Date badge */}
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      width: '50px', height: '54px', borderRadius: '12px', background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: config.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {eventDate.getDate()}
                      </span>
                    </div>
                    {/* Type badge on image */}
                    <div style={{
                      position: 'absolute', bottom: '12px', left: '12px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
                      padding: '5px 12px', borderRadius: '8px',
                      fontSize: '11px', fontWeight: 600, color: config.color,
                    }}>
                      <EventIcon size={13} /> {config.label}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {!event.img && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px',
                    }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: `${config.color}10`, color: config.color,
                      }}><EventIcon size={13} />{config.label}</span>
                      {event.community && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          in {event.community.name}
                        </span>
                      )}
                    </div>
                  )}

                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {event.title}
                  </h3>
                  <p style={{
                    fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px',
                    lineHeight: 1.5, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                  }}>{event.description}</p>

                  {/* Event Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                      <Clock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {eventDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} • {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      {event.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                      <Users size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span>{count}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''} attending</span>
                      {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5 && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, color: 'var(--danger)',
                          background: 'rgba(239,68,68,0.08)', padding: '2px 8px', borderRadius: '6px',
                        }}>
                          {spotsLeft} spots left!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attend / Capacity bar */}
                  {event.maxAttendees && (
                    <div style={{
                      width: '100%', height: '4px', borderRadius: '2px',
                      background: 'var(--border-light)', marginBottom: '14px', overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.min(100, (count / event.maxAttendees) * 100)}%`,
                        height: '100%', borderRadius: '2px',
                        background: isFull ? 'var(--danger)' : config.color,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  )}

                  <button
                    onClick={() => handleAttend(event.id)}
                    disabled={isFull && !isAttended}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      width: '100%', padding: '10px', borderRadius: '12px',
                      fontSize: '13px', fontWeight: 600, cursor: isFull && !isAttended ? 'not-allowed' : 'pointer',
                      fontFamily: 'Inter, sans-serif', border: 'none',
                      background: isAttended
                        ? 'var(--border-light)'
                        : isFull
                          ? 'var(--bg-primary)'
                          : config.color,
                      color: isAttended
                        ? '#64748b'
                        : isFull
                          ? 'var(--text-muted)'
                          : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isAttended ? '✓ Attending' : isFull ? 'Event Full' : <>Attend <ArrowRight size={14} /></>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEvents.length === 0 && (
        <div style={{
          background: 'var(--bg-card)', borderRadius: '18px', padding: '60px 24px',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <Calendar size={48} style={{ color: 'var(--border)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No events found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Try a different filter or create your own event!
          </p>
        </div>
      )}
    </div>
  );
}
