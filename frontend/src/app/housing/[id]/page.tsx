'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { MapPin, Star, Shield, ArrowLeft, Bookmark, Phone, Mail, MessageCircle, Building2, Send } from 'lucide-react';

export default function HousingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { isAuthenticated } = useAuthStore();
  const [housing, setHousing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' });
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) {
      api.getHousing(id).then(setHousing).catch(console.error).finally(() => setLoading(false));
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
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.saveHousing(id);
      setSaved(res.saved);
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return <div className="p-6 lg:p-8"><div className="shimmer h-96 rounded-xl max-w-4xl" /></div>;
  }

  if (!housing) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Housing not found</h2>
        <Link href="/housing" className="btn-primary mt-4 inline-block no-underline">Back to Listings</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Back */}
      <Link href="/housing" className="flex items-center gap-2 text-sm mb-6 no-underline" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to listings
      </Link>

      {/* Header Image Area */}
      <div className="rounded-2xl h-48 lg:h-64 mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 size={60} style={{ color: 'var(--text-muted)', opacity: 0.2 }} />
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
          {housing.isVerified && <span className="badge badge-success">✓ Verified</span>}
          {housing.isWomenFriendly && <span className="badge badge-danger"><Shield size={12} className="mr-1" />Women Safe</span>}
          <span className="badge badge-primary">{housing.type?.replace('_', ' ')}</span>
        </div>
        {isAuthenticated && (
          <button onClick={handleSave} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{ background: saved ? 'var(--primary)' : 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer' }}>
            <Bookmark size={18} color="white" fill={saved ? 'white' : 'none'} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-2">{housing.title}</h1>
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={16} /> {housing.address || housing.area}, {housing.city}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl font-bold gradient-text">₹{housing.rent?.toLocaleString()}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/month</span></div>
            {housing.deposit && <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Deposit: ₹{housing.deposit?.toLocaleString()}</div>}
            {housing.avgRating && (
              <div className="flex items-center gap-1 badge badge-warning">
                <Star size={14} /> {housing.avgRating} ({housing._count?.reviews} reviews)
              </div>
            )}
          </div>

          {/* Description */}
          <div className="glass-card p-5 mb-6">
            <h3 className="font-semibold mb-3">About</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{housing.description}</p>
          </div>

          {/* Amenities */}
          {housing.amenities?.length > 0 && (
            <div className="glass-card p-5 mb-6">
              <h3 className="font-semibold mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {housing.amenities.map((a: string) => (
                  <span key={a} className="badge badge-accent">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4">Reviews ({housing.reviews?.length || 0})</h3>
            {housing.reviews?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {housing.reviews.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                           style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                        {r.user?.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.user?.name}</p>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= r.rating ? 'star-filled' : 'star-empty'} fill={s <= r.rating ? '#fbbf24' : 'none'} />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
            )}

            {/* Add Review */}
            {isAuthenticated && (
              <form onSubmit={handleReview} className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <h4 className="text-sm font-semibold mb-3">Write a Review</h4>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <button type="button" key={s} onClick={() => setReviewForm({...reviewForm, rating: s})}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Star size={24} className={s <= reviewForm.rating ? 'star-filled' : 'star-empty'} fill={s <= reviewForm.rating ? '#fbbf24' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea className="input-field text-sm mb-3" rows={3} placeholder="Share your experience..." value={reviewForm.review}
                          onChange={(e) => setReviewForm({...reviewForm, review: e.target.value})} required />
                <button type="submit" className="btn-primary text-sm flex items-center gap-2" disabled={submitting}>
                  <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Sidebar */}
        <div>
          <div className="glass-card p-5 sticky top-6">
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="flex flex-col gap-3">
              {housing.contactPhone && (
                <a href={`tel:${housing.contactPhone}`} className="flex items-center gap-3 p-3 rounded-xl no-underline transition-all"
                   style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <Phone size={18} style={{ color: 'var(--success)' }} />
                  <span className="text-sm">{housing.contactPhone}</span>
                </a>
              )}
              {housing.contactEmail && (
                <a href={`mailto:${housing.contactEmail}`} className="flex items-center gap-3 p-3 rounded-xl no-underline transition-all"
                   style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <Mail size={18} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm truncate">{housing.contactEmail}</span>
                </a>
              )}
              {!housing.contactPhone && !housing.contactEmail && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Contact info not available</p>
              )}
            </div>
            <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              Listed by {housing.createdBy?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
