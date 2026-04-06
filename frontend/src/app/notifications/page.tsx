'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell, MessageCircle, Building2, Users, Trophy, Heart,
  Shield, ChevronRight, Check, X, Star, Calendar,
} from 'lucide-react';

/* ── Demo Data ──────────────────────────────────────────── */

const demoNotifications = [
  {
    id: 1, type: 'message', icon: MessageCircle, color: '#6366f1',
    title: 'New message from Vikram Singh',
    description: 'Looking forward to our coffee chat about Pune housing!',
    time: '2 min ago', unread: true, link: '/chat',
  },
  {
    id: 2, type: 'housing', icon: Building2, color: '#10b981',
    title: 'New Women-Safe listing in Hinjewadi',
    description: 'Skyline Residency — a verified 1 BHK matching your preferences is now available.',
    time: '1h ago', unread: true, link: '/housing',
  },
  {
    id: 3, type: 'community', icon: Users, color: '#06b6d4',
    title: 'You were mentioned in PCU Students',
    description: 'Rahul Sharma tagged you in a discussion about coworking spaces.',
    time: '3h ago', unread: true, link: '/communities',
  },
  {
    id: 4, type: 'reputation', icon: Trophy, color: '#f59e0b',
    title: 'Reputation milestone reached!',
    description: 'You earned 50 points and unlocked the Guide badge. Keep going!',
    time: 'Yesterday', unread: false, link: '/profile',
  },
];

/* ── Notifications Page ───────────────────────────────── */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(demoNotifications);
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Unread', 'Messages', 'Housing', 'Community'];

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const dismiss = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'Unread') return n.unread;
    if (filter === 'Messages') return n.type === 'message';
    if (filter === 'Housing') return n.type === 'housing';
    if (filter === 'Community') return n.type === 'community' || n.type === 'event';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 24px 100px' }}>

      {/* ══════════ Header ══════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
          }}>
            <Bell size={26} style={{ color: '#6366f1' }} />
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-6px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #f8f9fc',
              }}>{unreadCount}</div>
            )}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e' }}>
            Notifications
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            fontSize: '13px', fontWeight: 600, color: '#6366f1',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            <Check size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Mark all read
          </button>
        )}
      </div>

      {/* ══════════ Filter Tabs ══════════ */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '24px',
        overflowX: 'auto', paddingBottom: '4px',
      }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              border: filter === f ? 'none' : '1px solid #e5e7ee',
              background: filter === f ? '#6366f1' : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              transition: 'all 0.15s',
              boxShadow: filter === f ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            {f}
            {f === 'Unread' && unreadCount > 0 && (
              <span style={{
                marginLeft: '6px', fontSize: '10px', fontWeight: 700,
                background: filter === f ? 'rgba(255,255,255,0.3)' : 'rgba(99,102,241,0.1)',
                color: filter === f ? '#fff' : '#6366f1',
                padding: '2px 6px', borderRadius: '10px',
              }}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════ Notifications List ══════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '16px 18px', borderRadius: '16px',
                background: notif.unread ? 'rgba(99, 102, 241, 0.03)' : '#fff',
                border: notif.unread ? '1px solid rgba(99,102,241,0.2)' : '1px solid #f0f1f5',
                cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
              onClick={() => markRead(notif.id)}
            >
              {/* Icon */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${notif.color}10`, flexShrink: 0,
              }}>
                <Icon size={20} style={{ color: notif.color }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <p style={{
                    fontSize: '14px', fontWeight: notif.unread ? 600 : 500,
                    color: '#1a1a2e', margin: 0,
                  }}>{notif.title}</p>
                  {notif.unread && (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#6366f1', flexShrink: 0,
                    }} />
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                  {notif.description}
                </p>
                <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0, fontWeight: 500 }}>
                  {notif.time}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1',
                    padding: '4px', borderRadius: '6px', transition: 'color 0.15s',
                    display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                >
                  <X size={14} />
                </button>
                <Link href={notif.link} onClick={(e) => e.stopPropagation()} style={{
                  color: '#cbd5e1', display: 'flex', alignItems: 'center',
                  textDecoration: 'none',
                }}>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════ Empty State ══════════ */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: '#fff', borderRadius: '18px', border: '1px solid #f0f1f5',
        }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '20px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(99,102,241,0.06)', margin: '0 auto 16px',
          }}>
            <Bell size={32} style={{ color: '#cbd5e1' }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '16px', color: '#1a1a2e', marginBottom: '4px' }}>
            All caught up!
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            No notifications to show.
          </p>
        </div>
      )}
    </div>
  );
}
