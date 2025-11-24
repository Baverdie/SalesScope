const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'An error occurred',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data?.accessToken) {
      this.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  async logout(refreshToken: string) {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      this.setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
      }
    }
  }

  async refreshToken(refreshToken: string) {
    const response = await this.request<any>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.data?.accessToken) {
      this.setAccessToken(response.data.accessToken);
    }

    return response;
  }

  async getMe() {
    return this.request('/api/auth/me', {
      method: 'GET',
    });
  }

  // Health check
  async health() {
    return this.request('/health', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient(API_URL);
