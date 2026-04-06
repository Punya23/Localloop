const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('localloop_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('localloop_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('localloop_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
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
