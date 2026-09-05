const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

class ApiClient {
  private token: string | null = null;

  /** Short-lived response cache for GETs, keyed by endpoint. */
  private cache = new Map<string, CacheEntry>();
  /**
   * Requests currently in flight, keyed by endpoint. Two components mounting at
   * once — or React's development double-render — share one network call
   * instead of racing duplicates.
   */
  private inFlight = new Map<string, Promise<unknown>>();

  /**
   * Client-side TTLs in milliseconds, matched by endpoint prefix (longest wins).
   * These sit deliberately at or below the server's `Cache-Control: max-age` for
   * the same routes, so the client is never staler than a shared cache would be.
   * Anything not listed here is always fetched fresh.
   */
  private static readonly GET_TTL: ReadonlyArray<readonly [string, number]> = [
    ['/ai/price-intelligence', 5 * 60_000],
    ['/ai/recommendations/housing', 2 * 60_000],
    ['/ai/match/people', 2 * 60_000],
    ['/ai/insights', 2 * 60_000],
    ['/reputation/leaderboard', 60_000],
    ['/reputation/', 30_000],
    ['/communities', 60_000],
    ['/events', 60_000],
    ['/housing', 30_000],
    ['/users/dashboard', 30_000],
    ['/users/search', 30_000],
    ['/posts/community', 20_000],
    ['/posts/feed', 20_000],
    // Admin panel — every table (users/housings/communities/reports/events/...)
    // re-fetches with the same params on every tab switch and re-render.
    // Short TTL absorbs that; any admin write already flushes the whole
    // client cache (see NON_INVALIDATING_WRITES), so an action's own list
    // always reflects it immediately.
    ['/admin', 15_000],
    // Deliberately NOT caching /chat/* — messages arrive over the socket.io
    // connection, not through this client, so a cached response here could
    // serve a stale unread count or message list after a live push.
  ];

  /**
   * Writes that cannot invalidate any cached read. Without this list, a
   * fire-and-forget view-tracking POST would flush the whole cache every time a
   * listing is opened.
   */
  private static readonly NON_INVALIDATING_WRITES: ReadonlyArray<string> = [
    '/ai/track/view',
    '/ai/chat',
    '/users/notifications/read',
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('localloop_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    // Identity changed — nothing cached under the previous session may be reused.
    this.invalidateCache();
    if (typeof window !== 'undefined') {
      localStorage.setItem('localloop_token', token);
    }
  }

  clearToken() {
    this.token = null;
    this.invalidateCache();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('localloop_token');
    }
  }

  /** Drop every cached GET response. Safe to call at any time. */
  invalidateCache() {
    this.cache.clear();
  }

  private static ttlFor(endpoint: string): number {
    let ttl = 0;
    let matched = 0;
    for (const [prefix, value] of ApiClient.GET_TTL) {
      if (endpoint.startsWith(prefix) && prefix.length > matched) {
        matched = prefix.length;
        ttl = value;
      }
    }
    return ttl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();

    if (method === 'GET') {
      const ttl = ApiClient.ttlFor(endpoint);

      if (ttl > 0) {
        const hit = this.cache.get(endpoint);
        if (hit && hit.expiresAt > Date.now()) return hit.data as T;
      }

      // Join an identical request that is already on the wire.
      const pending = this.inFlight.get(endpoint);
      if (pending) return pending as Promise<T>;

      const task = this.execute<T>(endpoint, options)
        .then((data) => {
          if (ttl > 0) this.cache.set(endpoint, { data, expiresAt: Date.now() + ttl });
          return data;
        })
        .finally(() => {
          this.inFlight.delete(endpoint);
        });

      this.inFlight.set(endpoint, task);
      return task;
    }

    const result = await this.execute<T>(endpoint, options);

    // A write can invalidate almost anything, so flush rather than guess.
    if (!ApiClient.NON_INVALIDATING_WRITES.some((p) => endpoint.startsWith(p))) {
      this.invalidateCache();
    }
    return result;
  }

  private async execute<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.clearToken();
        // Redirect if not already on login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fire-and-forget ping to wake a sleeping Render free-tier dyno. Call this
   * the moment any page mounts (see AuthProvider) so the ~30-60s cold-start
   * penalty overlaps with the user reading the page / typing their password,
   * instead of landing entirely after they hit "Log in". Never throws —
   * a failed warm-up just means the real request pays the cold-start cost.
   */
  warmUp(): void {
    if (typeof window === 'undefined') return;
    fetch(`${API_BASE}/health`, { cache: 'no-store' }).catch(() => undefined);
  }

  // Auth
  async register(data: { name: string; email: string; password: string }) {
    return this.request<{ user: any; token: string; welcomeMessage: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Users
  async completeOnboarding(data: any) {
    return this.request<any>('/users/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request<any>('/users/profile');
  }

  async updateProfile(data: any) {
    return this.request<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getDashboard() {
    return this.request<any>('/users/dashboard');
  }

  async getNotifications() {
    return this.request<any>('/users/notifications');
  }

  async markNotificationsRead() {
    return this.request<any>('/users/notifications/read', { method: 'PATCH' });
  }

  // Verification
  async uploadIdProof(data: { idProofUrl: string; idProofType: string }) {
    return this.request<any>('/users/verify/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVerificationStatus() {
    return this.request<any>('/users/verify/status');
  }

  async applyForMentor(data: { expertise: string[]; experience: string; availability: string }) {
    return this.request<any>('/users/mentor/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Housing
  async getHousings(params?: Record<string, string | number>) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return this.request<any>(`/housing${queryString}`);
  }

  async getHousing(id: string) {
    return this.request<any>(`/housing/${id}`);
  }

  async createHousing(data: any) {
    return this.request<any>('/housing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reviewHousing(id: string, data: { rating: number; review: string }) {
    return this.request<any>(`/housing/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async saveHousing(id: string) {
    return this.request<any>(`/housing/${id}/save`, { method: 'POST' });
  }

  async getSavedHousings() {
    return this.request<any>('/housing/saved');
  }

  // Communities
  async getCommunities(city?: string) {
    const query = city ? `?city=${city}` : '';
    return this.request<any>(`/communities${query}`);
  }

  async getCommunity(id: string) {
    return this.request<any>(`/communities/${id}`);
  }

  async createCommunity(data: any) {
    return this.request<any>('/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinCommunity(id: string) {
    return this.request<any>(`/communities/${id}/join`, { method: 'POST' });
  }

  async leaveCommunity(id: string) {
    return this.request<any>(`/communities/${id}/leave`, { method: 'DELETE' });
  }

  async getMyCommunities() {
    return this.request<any>('/communities/my');
  }

  // Posts
  async createPost(data: { content: string; communityId: string }) {
    return this.request<any>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCommunityPosts(communityId: string, page?: number) {
    const query = page ? `?page=${page}` : '';
    return this.request<any>(`/posts/community/${communityId}${query}`);
  }

  async getFeedPosts() {
    return this.request<any>('/posts/feed');
  }

  async addComment(postId: string, content: string) {
    return this.request<any>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Chat
  async getConversations() {
    return this.request<any>('/chat/conversations');
  }

  async getMessages(partnerId: string, page?: number) {
    const query = page ? `?page=${page}` : '';
    return this.request<any>(`/chat/messages/${partnerId}${query}`);
  }

  // Events
  async getEvents(upcoming?: boolean) {
    const query = upcoming !== undefined ? `?upcoming=${upcoming}` : '';
    return this.request<any>(`/events${query}`);
  }

  async getEvent(id: string) {
    return this.request<any>(`/events/${id}`);
  }

  async createEvent(data: any) {
    return this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async attendEvent(id: string) {
    return this.request<any>(`/events/${id}/attend`, { method: 'POST' });
  }

  // Reputation
  async getReputation(userId: string) {
    return this.request<any>(`/reputation/${userId}`);
  }

  async getLeaderboard(city?: string) {
    const query = city ? `?city=${city}` : '';
    return this.request<any>(`/reputation/leaderboard${query}`);
  }

  // ════════════ ADMIN ════════════

  async getAdminDashboard() {
    return this.request<any>('/admin/dashboard');
  }

  async getAdminUsers(page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    return this.request<any>(`/admin/users?${params}`);
  }

  async getAdminUserDetail(userId: string) {
    return this.request<any>(`/admin/users/${userId}`);
  }

  async getPendingVerifications() {
    return this.request<any>('/admin/verifications/pending');
  }

  async verifyUserAdmin(userId: string, approved: boolean, notes?: string) {
    return this.request<any>(`/admin/verifications/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, notes }),
    });
  }

  async getAdminHousings(page = 1, limit = 20) {
    return this.request<any>(`/admin/housings?page=${page}&limit=${limit}`);
  }

  async verifyHousingAdmin(housingId: string, verified: boolean) {
    return this.request<any>(`/admin/housings/${housingId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    });
  }

  async adminCreateHousing(data: any) {
    return this.request<any>('/admin/housings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingMentors() {
    return this.request<any>('/admin/mentors/pending');
  }

  async approveMentorAdmin(profileId: string, approved: boolean) {
    return this.request<any>(`/admin/mentors/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    });
  }

  async makeUserAdmin(userId: string) {
    return this.request<any>(`/admin/users/${userId}/make-admin`, {
      method: 'PATCH',
    });
  }

  // ════════════ FIND PEOPLE ════════════

  async searchUsers(params?: Record<string, string | number>) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return this.request<any>(`/users/search${queryString}`);
  }

  // ════════════ HOUSING INQUIRY ════════════

  async sendHousingInquiry(housingId: string, message: string) {
    return this.request<any>(`/users/housing-inquiry/${housingId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // ════════════ CLOUDINARY UPLOAD ════════════

  async uploadImage(file: File, folder: string = 'general'): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async uploadImages(files: File[], folder: string = 'general'): Promise<{ images: { url: string; publicId: string }[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload/images`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  // ════════════ ADMIN MESSAGES ════════════

  async getAdminMessages(page = 1, limit = 20) {
    return this.request<any>(`/admin/messages?page=${page}&limit=${limit}`);
  }

  // ════════════ HOUSING MANAGEMENT (Admin) ════════════

  async adminUpdateHousing(housingId: string, data: any) {
    return this.request<any>(`/admin/housings/${housingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async adminDeleteHousing(housingId: string) {
    return this.request<any>(`/admin/housings/${housingId}`, {
      method: 'DELETE',
    });
  }

  async getAdminCommunities(page = 1, limit = 20) {
    return this.request<any>(`/admin/communities?page=${page}&limit=${limit}`);
  }

  async adminDeleteCommunity(communityId: string) {
    return this.request<any>(`/admin/communities/${communityId}`, {
      method: 'DELETE',
    });
  }

  async verifyCommunityAdmin(communityId: string, verified: boolean) {
    return this.request<any>(`/admin/communities/${communityId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    });
  }

  async adminPushNotification(title: string, message: string) {
    return this.request<any>('/admin/push-notification', {
      method: 'POST',
      body: JSON.stringify({ title, message }),
    });
  }

  async adminBanUser(userId: string) {
    return this.request<any>(`/admin/users/${userId}/ban`, {
      method: 'PATCH',
    });
  }

  async getNotificationHistory(page = 1, limit = 20) {
    return this.request<any>(`/admin/notification-history?page=${page}&limit=${limit}`);
  }

  async getAdminReports(status?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    return this.request<any>(`/admin/reports?${params.toString()}`);
  }

  async resolveReport(reportId: string, status: string, adminNotes?: string) {
    return this.request<any>(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  async getAuditLog(page = 1, limit = 30) {
    return this.request<any>(`/admin/audit-log?page=${page}&limit=${limit}`);
  }

  async getAdminEvents(page = 1, limit = 20) {
    return this.request<any>(`/admin/events?page=${page}&limit=${limit}`);
  }

  async adminDeleteEvent(eventId: string) {
    return this.request<any>(`/admin/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // ════════════ COMMUNITY GROUP CHAT & POLLS & MEMBERS ════════════

  async getCommunityMessages(communityId: string, page = 1) {
    return this.request<any>(`/chat/community/${communityId}?page=${page}`);
  }

  async sendCommunityMessage(communityId: string, content: string) {
    return this.request<any>(`/chat/community/${communityId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getCommunityMembers(communityId: string, page = 1) {
    return this.request<any>(`/communities/${communityId}/members?page=${page}`);
  }

  async getCommunityPolls(communityId: string) {
    return this.request<any>(`/communities/${communityId}/polls`);
  }

  async createCommunityPoll(communityId: string, data: { question: string; options: string[]; expiresInDays?: number }) {
    return this.request<any>(`/communities/${communityId}/polls`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async voteCommunityPoll(communityId: string, pollId: string, optionIndex: number) {
    return this.request<any>(`/communities/${communityId}/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIndex }),
    });
  }

  // ════════════ AI / ML ════════════

  async getAIRecommendations(limit = 10) {
    return this.request<any>(`/ai/recommendations/housing?limit=${limit}`);
  }

  async getSimilarHousings(housingId: string) {
    return this.request<any>(`/ai/recommendations/housing/${housingId}/similar`);
  }

  async getPriceIntelligence(city = 'Pune') {
    return this.request<any>(`/ai/price-intelligence?city=${city}`);
  }

  async getAreaPriceDetail(area: string, city = 'Pune') {
    return this.request<any>(`/ai/price-intelligence/area/${encodeURIComponent(area)}?city=${city}`);
  }

  async predictRent(data: { area: string; room_type: string; has_ac: boolean; has_food: boolean }) {
    return this.request<any>('/ai/predict-rent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDealScore(housingId: string) {
    return this.request<any>(`/ai/price-intelligence/deal-score/${housingId}`);
  }

  async getAIMatches(type: 'friends' | 'roommates' = 'friends', limit = 10) {
    return this.request<any>(`/ai/match/people?type=${type}&limit=${limit}`);
  }

  async sendAIChatMessage(message: string) {
    return this.request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getAIChatHistory() {
    return this.request<any>('/ai/chat/history');
  }

  async clearAIChatHistory() {
    return this.request<any>('/ai/chat/history', { method: 'DELETE' });
  }

  async trackHousingView(housingId: string, duration?: number) {
    return this.request<any>('/ai/track/view', {
      method: 'POST',
      body: JSON.stringify({ housingId, duration }),
    });
  }

  async getAIInsights() {
    return this.request<any>('/ai/insights');
  }
}

export const api = new ApiClient();
