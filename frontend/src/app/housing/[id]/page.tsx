'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  MapPin, Star, Shield, ArrowLeft, Bookmark, Phone, Mail,
  MessageCircle, Building2, Send, Wifi, Car, Zap, Droplets,
  UtensilsCrossed, Dumbbell, Lock, BedDouble, Bath, Maximize2,
  Heart, ChevronLeft, ChevronRight, CheckCircle2,
} from 'lucide-react';


const amenityIcons: Record<string, any> = {
  'WiFi': Wifi, 'Free WiFi': Wifi, 'Parking': Car, 'Power Backup': Zap,
  'Gym': Dumbbell, 'Swimming Pool': Droplets, '24/7 Security': Shield,
  'CCTV': Shield, 'Lift': Building2, 'Meals Included': UtensilsCrossed,
  'Laundry': Droplets, 'Housekeeping': CheckCircle2, 'Hot Water': Droplets, 'Lock': Lock,
};

/* ── Housing Detail Page ──────────────────────────────── */

export default function HousingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isAuthenticated } = useAuthStore();
  const [housing, setHousing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' });
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Inquiry state (Phase 9)
  const [inquiryMsg, setInquiryMsg] = useState('Hi, I am interested in this property. Is it still available?');
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  useEffect(() => {
    if (id) {
      api.getHousing(id)
        .then((data) => { if (data) setHousing(data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.reviewHousing(id, reviewForm);
      const updated = await api.getHousing(id);
      setHousing(updated);
      setReviewForm({ rating: 5, review: '' });
    } catch (err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const handleSave = () => {
    setSaved(!saved);
    api.saveHousing(id).catch(() => {});
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to send a message to the owner.');
      router.push('/login');
      return;
    }
    if (!inquiryMsg.trim()) return;

    setSendingInquiry(true);
    try {
      await api.sendHousingInquiry(id, inquiryMsg);
      setInquirySent(true);
      setShowInquiryForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        <div style={{ height: '350px', borderRadius: '20px', background: '#f0f1f5', animation: 'pulse 1.5s infinite', marginBottom: '24px' }} />
        <div style={{ height: '24px', width: '300px', borderRadius: '10px', background: '#f0f1f5', animation: 'pulse 1.5s infinite', marginBottom: '12px' }} />
        <div style={{ height: '18px', width: '200px', borderRadius: '8px', background: '#f0f1f5', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  const h = housing; if (!h) return <div style={{textAlign: 'center', padding: '100px'}}>Property not found</div>;
  const images = h.images || [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop',
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 24px 100px' }}>

      {/* ══════════ Back Button ══════════ */}
      <button onClick={() => router.back()} style={{
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500,
        color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', marginBottom: '20px',
      }}>
        <ArrowLeft size={18} /> Back to listings
      </button>

      {/* ══════════ Image Gallery ══════════ */}
      <div style={{
        borderRadius: '20px', overflow: 'hidden', position: 'relative',
        height: '360px', marginBottom: '24px',
      }}>
        <div style={{
          width: '100%', height: '100%',
          backgroundImage: `url(${images[activeImage]})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'background-image 0.4s ease',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)',
          }} />
        </div>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {h.isVerified && (
            <span style={{
              padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
              background: 'rgba(99,102,241,0.92)', color: '#fff', backdropFilter: 'blur(4px)',
            }}>✓ VERIFIED</span>
          )}
          {h.isWomenFriendly && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
              background: 'rgba(255,255,255,0.92)', color: '#10b981', backdropFilter: 'blur(4px)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
              WOMEN SAFE
            </span>
          )}
          <span style={{
            padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
            background: 'rgba(255,255,255,0.92)', color: '#1a1a2e', backdropFilter: 'blur(4px)',
          }}>{h.type?.replace('_', ' ')}</span>
        </div>

        {/* Save button */}
        <button onClick={handleSave} style={{
          position: 'absolute', top: '16px', right: '16px',
          width: '42px', height: '42px', borderRadius: '12px', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          background: saved ? '#6366f1' : 'rgba(255,255,255,0.92)',
          color: saved ? '#fff' : '#94a3b8',
          border: 'none', backdropFilter: 'blur(4px)', transition: 'all 0.2s',
        }}>
          <Heart size={18} fill={saved ? '#fff' : 'none'} />
        </button>

        {/* Gallery nav */}
        {images.length > 1 && (
          <>
            <button onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)} style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              width: '36px', height: '36px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              background: 'rgba(255,255,255,0.85)', border: 'none', color: '#1a1a2e',
              backdropFilter: 'blur(4px)',
            }}><ChevronLeft size={18} /></button>
            <button onClick={() => setActiveImage((i) => (i + 1) % images.length)} style={{
              position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
              width: '36px', height: '36px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              background: 'rgba(255,255,255,0.85)', border: 'none', color: '#1a1a2e',
              backdropFilter: 'blur(4px)',
            }}><ChevronRight size={18} /></button>
            {/* Dots */}
            <div style={{
              position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '6px',
            }}>
              {images.map((_: any, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)} style={{
                  width: activeImage === i ? '20px' : '8px', height: '8px',
                  borderRadius: '4px', border: 'none', cursor: 'pointer',
                  background: activeImage === i ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ══════════ Main Content Grid ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

        {/* ── Left Column ── */}
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
            {h.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#94a3b8', marginBottom: '18px' }}>
            <MapPin size={15} /> {h.area || h.address}, {h.city}
          </div>

          {/* Price + Rating */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px',
            flexWrap: 'wrap',
          }}>
            <div>
              <span style={{
                fontSize: '32px', fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>₹{h.rent?.toLocaleString()}</span>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>/month</span>
            </div>
            {h.deposit && (
              <div style={{
                padding: '5px 14px', borderRadius: '10px', background: '#f8f9fc',
                fontSize: '13px', color: '#475569', border: '1px solid #e5e7ee',
              }}>
                Deposit: <strong>₹{h.deposit?.toLocaleString()}</strong>
              </div>
            )}
            {h.avgRating && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 14px', borderRadius: '10px', background: '#fffbeb',
                fontSize: '13px', fontWeight: 600, color: '#f59e0b',
                border: '1px solid #fde68a',
              }}>
                <Star size={14} fill="#f59e0b" /> {h.avgRating} ({h.reviews?.length || 0} reviews)
              </div>
            )}
          </div>

          {/* Property Specs */}
          {(h.beds > 0 || h.baths > 0 || h.sqft > 0) && (
            <div style={{
              display: 'flex', gap: '20px', padding: '16px 20px', borderRadius: '14px',
              background: '#f8f9fc', marginBottom: '24px', border: '1px solid #e5e7ee',
            }}>
              {h.beds > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                  <BedDouble size={18} style={{ color: '#6366f1' }} /> {h.beds} Bedroom{h.beds > 1 ? 's' : ''}
                </div>
              )}
              {h.baths > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                  <Bath size={18} style={{ color: '#06b6d4' }} /> {h.baths} Bathroom{h.baths > 1 ? 's' : ''}
                </div>
              )}
              {h.sqft > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569' }}>
                  <Maximize2 size={18} style={{ color: '#10b981' }} /> {h.sqft} sq ft
                </div>
              )}
            </div>
          )}

          {/* About */}
          <div style={{
            background: '#fff', borderRadius: '18px', padding: '22px',
            border: '1px solid #e5e7ee', marginBottom: '20px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginBottom: '12px' }}>About</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>{h.description}</p>
          </div>

          {/* Amenities */}
          {h.amenities?.length > 0 && (
            <div style={{
              background: '#fff', borderRadius: '18px', padding: '22px',
              border: '1px solid #e5e7ee', marginBottom: '20px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginBottom: '14px' }}>Amenities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                {h.amenities.map((a: string) => {
                  const AIcon = amenityIcons[a] || CheckCircle2;
                  return (
                    <div key={a} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '12px', background: '#f8f9fc',
                      fontSize: '13px', color: '#475569', fontWeight: 500,
                    }}>
                      <AIcon size={16} style={{ color: '#6366f1', flexShrink: 0 }} /> {a}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div style={{
            background: '#fff', borderRadius: '18px', padding: '22px',
            border: '1px solid #e5e7ee',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginBottom: '18px' }}>
              Reviews ({h.reviews?.length || 0})
            </h3>
            {h.reviews?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {h.reviews.map((r: any, idx: number) => (
                  <div key={r.id} style={{
                    padding: '16px', borderRadius: '14px', background: '#f8f9fc',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700,
                        background: `linear-gradient(135deg, ${['#c4b5fd', '#6ee7b7', '#93c5fd', '#fca5a5'][idx % 4]}, ${['#a78bfa', '#34d399', '#60a5fa', '#f87171'][idx % 4]})`,
                        color: '#fff',
                      }}>{r.user?.name?.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{r.user?.name}</p>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} fill={s <= r.rating ? '#fbbf24' : 'none'} style={{ color: s <= r.rating ? '#fbbf24' : '#e5e7ee' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{r.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
                No reviews yet. Be the first to share your experience!
              </p>
            )}

            {/* Write Review */}
            {isAuthenticated && (
              <form onSubmit={handleReview} style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #e5e7ee' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '12px' }}>Write a Review</h4>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button type="button" key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    }}>
                      <Star size={24} fill={s <= reviewForm.rating ? '#fbbf24' : 'none'} style={{ color: s <= reviewForm.rating ? '#fbbf24' : '#e5e7ee' }} />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3} placeholder="Share your experience..."
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                  required
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    border: '1px solid #e5e7ee', background: '#f8f9fc', fontSize: '14px',
                    outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'none',
                    color: '#1a1a2e', marginBottom: '12px',
                  }}
                />
                <button type="submit" disabled={submitting} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                  background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                }}>
                  <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Right Sidebar: Contact ── */}
        <div>
          <div style={{
            background: '#fff', borderRadius: '18px', padding: '22px',
            border: '1px solid #e5e7ee', position: 'sticky', top: '72px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginBottom: '18px' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {h.contactPhone && (
                <a href={`tel:${h.contactPhone}`} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                  borderRadius: '14px', background: '#f8f9fc', textDecoration: 'none',
                  color: '#1a1a2e', fontSize: '14px', fontWeight: 500, transition: 'all 0.15s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = 'rgba(16,185,129,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#f8f9fc'; }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.1)',
                  }}>
                    <Phone size={18} style={{ color: '#10b981' }} />
                  </div>
                  {h.contactPhone}
                </a>
              )}
              {h.contactEmail && (
                <a href={`mailto:${h.contactEmail}`} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                  borderRadius: '14px', background: '#f8f9fc', textDecoration: 'none',
                  color: '#1a1a2e', fontSize: '14px', fontWeight: 500, transition: 'all 0.15s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#f8f9fc'; }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.1)',
                  }}>
                    <Mail size={18} style={{ color: '#6366f1' }} />
                  </div>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.contactEmail}</span>
                </a>
              )}

              {inquirySent ? (
                <div style={{
                  padding: '14px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)',
                  color: '#10b981', fontSize: '14px', fontWeight: 600, textAlign: 'center', marginTop: '6px',
                }}>
                  <CheckCircle2 size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
                  Message Sent
                </div>
              ) : showInquiryForm ? (
                <form onSubmit={handleInquiry} style={{ marginTop: '10px' }}>
                  <textarea
                    rows={4}
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7ee',
                      background: '#f8f9fc', fontSize: '13px', outline: 'none', color: '#1a1a2e',
                      fontFamily: 'Inter, sans-serif', resize: 'none', marginBottom: '8px',
                    }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setShowInquiryForm(false)} style={{
                      flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                      background: '#f8f9fc', color: '#475569', border: '1px solid #e5e7ee', cursor: 'pointer',
                    }}>Cancel</button>
                    <button type="submit" disabled={sendingInquiry} style={{
                      flex: 2, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                      background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
                    }}>{sendingInquiry ? 'Sending...' : 'Send to Owner'}</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowInquiryForm(true)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '13px', borderRadius: '14px', fontSize: '14px', fontWeight: 600,
                  background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', marginTop: '6px',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.3)', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.4)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.3)'}
                >
                  <MessageCircle size={16} /> Send Message
                </button>
              )}
            </div>

            <div style={{
              marginTop: '18px', padding: '14px 16px', borderRadius: '14px',
              background: '#f8f9fc', fontSize: '12px', color: '#94a3b8',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Building2 size={14} style={{ flexShrink: 0 }} />
              Listed by <strong style={{ color: '#475569' }}>{h.createdBy?.name}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
