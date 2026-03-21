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
    return this.request<{ user: any; token: string }>('/auth/register', {
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
}

export const api = new ApiClient();
