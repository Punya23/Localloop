'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ArrowLeft, Users, Send, MessageCircle, Clock } from 'lucide-react';

export default function CommunityDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { isAuthenticated, user } = useAuthStore();
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      Promise.all([
        api.getCommunity(id),
        api.getCommunityPosts(id),
      ]).then(([comm, postData]) => {
        setCommunity(comm);
        setPosts(postData.data || []);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      await api.createPost({ content: newPost, communityId: id });
      const postData = await api.getCommunityPosts(id);
      setPosts(postData.data || []);
      setNewPost('');
    } catch (err: any) { alert(err.message); }
    finally { setPosting(false); }
  };

  const handleComment = async (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      await api.addComment(postId, text);
      const postData = await api.getCommunityPosts(id);
      setPosts(postData.data || []);
      setCommentText({ ...commentText, [postId]: '' });
    } catch (err: any) { alert(err.message); }
  };

  if (loading) {
    return <div className="p-6 lg:p-8"><div className="shimmer h-64 rounded-xl max-w-3xl" /></div>;
  }

  if (!community) {
    return <div className="p-6 text-center py-20"><h2>Community not found</h2></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link href="/communities" className="flex items-center gap-2 text-sm mb-6 no-underline" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to communities
      </Link>

      {/* Community Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            {community.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{community.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><Users size={14} /> {community._count?.members || community.memberCount} members</span>
              <span>·</span>
              <span>{community._count?.posts || 0} posts</span>
            </div>
            {community.description && <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{community.description}</p>}
          </div>
        </div>
      </div>

      {/* New Post */}
      {isAuthenticated && (
        <form onSubmit={handlePost} className="glass-card p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <textarea className="input-field text-sm" rows={2} placeholder="Share something with the community..." value={newPost}
                        onChange={(e) => setNewPost(e.target.value)} required />
              <div className="flex justify-end mt-2">
                <button type="submit" className="btn-primary text-sm flex items-center gap-2" disabled={posting || !newPost.trim()}>
                  <Send size={14} /> {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Posts Feed */}
      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <MessageCircle size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No posts yet. Start the conversation!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="glass-card p-5">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                     style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  {post.user?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{post.user?.name}</p>
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-sm mb-4 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>

              {/* Comments */}
              <div style={{ borderTop: '1px solid var(--border)' }} className="pt-3">
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  <MessageCircle size={12} className="inline mr-1" /> {post._count?.comments || 0} comments
                </p>
                {post.comments?.map((c: any) => (
                  <div key={c.id} className="flex gap-2 mb-2 ml-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                         style={{ background: 'var(--bg-card)' }}>
                      {c.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-medium">{c.user?.name}</span>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.content}</p>
                    </div>
                  </div>
                ))}

                {isAuthenticated && (
                  <div className="flex gap-2 mt-2">
                    <input className="input-field text-xs flex-1" placeholder="Write a comment..."
                           value={commentText[post.id] || ''}
                           onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })} />
                    <button onClick={() => handleComment(post.id)} className="btn-primary text-xs px-3" disabled={!commentText[post.id]?.trim()}>
                      <Send size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
