import type { ApiResponse } from '@salesscope/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type for requests with a body
    if (options.body) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Important for cookies
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
        },
      }));
      throw new Error(error.error?.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    name: string;
    organizationName: string;
  }): Promise<ApiResponse<{ accessToken: string }>> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ accessToken: string }>> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refresh(): Promise<ApiResponse<{ accessToken: string }>> {
    return this.request('/api/auth/refresh', {
      method: 'POST',
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/api/auth/me');
  }

  // Dataset endpoints
  async uploadDataset(formData: FormData): Promise<ApiResponse> {
    const url = `${this.baseURL}/api/datasets/upload`;

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData, // Don't set Content-Type, let browser handle it
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
        },
      }));
      throw new Error(error.error?.message || 'Upload failed');
    }

    return response.json();
  }

  async listDatasets(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse> {
    return this.request(
      `/api/datasets?page=${page}&limit=${limit}`
    );
  }

  async getDataset(datasetId: string): Promise<ApiResponse> {
    return this.request(`/api/datasets/${datasetId}`);
  }

  async deleteDataset(datasetId: string): Promise<ApiResponse> {
    return this.request(`/api/datasets/${datasetId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getKPIs(datasetId: string, filters: any = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.product) params.append('product', filters.product);

    const query = params.toString();
    return this.request(
      `/api/analytics/${datasetId}/kpis${query ? `?${query}` : ''}`
    );
  }

  async getRevenueByDate(
    datasetId: string,
    filters: any = {}
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.product) params.append('product', filters.product);

    const query = params.toString();
    return this.request(
      `/api/analytics/${datasetId}/revenue-by-date${query ? `?${query}` : ''}`
    );
  }

  async getRevenueByCategory(
    datasetId: string,
    filters: any = {}
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.product) params.append('product', filters.product);

    const query = params.toString();
    return this.request(
      `/api/analytics/${datasetId}/revenue-by-category${query ? `?${query}` : ''}`
    );
  }

  async getRevenueByProduct(
    datasetId: string,
    filters: any = {}
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);
    if (filters.product) params.append('product', filters.product);

    const query = params.toString();
    return this.request(
      `/api/analytics/${datasetId}/revenue-by-product${query ? `?${query}` : ''}`
    );
  }

  async getAvailableFilters(datasetId: string): Promise<ApiResponse> {
    return this.request(`/api/analytics/${datasetId}/filters`);
  }

  // Analytics - Dashboard endpoints
  async getOverview(): Promise<ApiResponse> {
    return this.request('/api/analytics/overview');
  }

  async getDatasetsSummary(): Promise<ApiResponse> {
    return this.request('/api/analytics/datasets-summary');
  }

  async getTrends(): Promise<ApiResponse> {
    return this.request('/api/analytics/trends');
  }
}

export const apiClient = new ApiClient(API_URL);