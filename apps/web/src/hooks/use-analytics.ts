import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface KPIs {
	totalRevenue: number;
	averageRevenue: number;
	totalSales: number;
	totalQuantity: number;
}

interface RevenueByDate {
	date: string;
	revenue: number;
	quantity: number;
}

interface RevenueByCategory {
	category: string;
	revenue: number;
	count: number;
}

interface RevenueByProduct {
	product: string;
	revenue: number;
	quantity: number;
}

interface AnalyticsFilters {
	startDate?: string;
	endDate?: string;
	category?: string;
	product?: string;
}

export function useKPIs(datasetId: string, filters: AnalyticsFilters = {}) {
	return useQuery({
		queryKey: ['analytics', datasetId, 'kpis', filters],
		queryFn: async () => {
			const response = await apiClient.getKPIs(datasetId, filters);
			if (!response.success) {
				throw new Error('Failed to fetch KPIs');
			}
			return response.data as KPIs;
		},
		enabled: !!datasetId,
	});
}

export function useRevenueByDate(
	datasetId: string,
	filters: AnalyticsFilters = {}
) {
	return useQuery({
		queryKey: ['analytics', datasetId, 'revenue-by-date', filters],
		queryFn: async () => {
			const response = await apiClient.getRevenueByDate(datasetId, filters);
			if (!response.success) {
				throw new Error('Failed to fetch revenue by date');
			}
			return response.data as RevenueByDate[];
		},
		enabled: !!datasetId,
	});
}

export function useRevenueByCategory(
	datasetId: string,
	filters: AnalyticsFilters = {}
) {
	return useQuery({
		queryKey: ['analytics', datasetId, 'revenue-by-category', filters],
		queryFn: async () => {
			const response = await apiClient.getRevenueByCategory(
				datasetId,
				filters
			);
			if (!response.success) {
				throw new Error('Failed to fetch revenue by category');
			}
			return response.data as RevenueByCategory[];
		},
		enabled: !!datasetId,
	});
}

export function useRevenueByProduct(
	datasetId: string,
	filters: AnalyticsFilters = {}
) {
	return useQuery({
		queryKey: ['analytics', datasetId, 'revenue-by-product', filters],
		queryFn: async () => {
			const response = await apiClient.getRevenueByProduct(datasetId, filters);
			if (!response.success) {
				throw new Error('Failed to fetch revenue by product');
			}
			return response.data as RevenueByProduct[];
		},
		enabled: !!datasetId,
	});
}

export function useAvailableFilters(datasetId: string) {
	return useQuery({
		queryKey: ['analytics', datasetId, 'filters'],
		queryFn: async () => {
			const response = await apiClient.getAvailableFilters(datasetId);
			if (!response.success) {
				throw new Error('Failed to fetch filters');
			}
			return response.data as { categories: string[]; products: string[] };
		},
		enabled: !!datasetId,
	});
}