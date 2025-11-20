// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: OrganizationRole;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

// Dataset types
export interface Dataset {
  id: string;
  organizationId: string;
  name: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columns: DatasetColumn[];
  status: DatasetStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetColumn {
  name: string;
  type: ColumnType;
  nullable: boolean;
}

export enum ColumnType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
}

export enum DatasetStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

// Analytics types
export interface SalesData {
  date: string;
  revenue: number;
  quantity: number;
  product?: string;
  category?: string;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  products?: string[];
}

export interface TopProduct {
  product: string;
  revenue: number;
  quantity: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  percentage: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueChange: number; // Percentage change vs previous period
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
