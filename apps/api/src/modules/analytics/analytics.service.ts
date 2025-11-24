import { prisma } from '../../utils/db.js';
import { redis } from '../../utils/redis.js';

interface AnalyticsFilters {
	startDate?: string;
	endDate?: string;
	category?: string;
	product?: string;
	type?: string; // Added 'type' property to the interface
	limit?: number; // Added 'limit' property to the interface
}

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

export interface OverviewStats {
	totalRevenue: number;
	totalSales: number;
	totalDatasets: number;
	datasetsReady: number;
	dateRange: {
		earliest: Date | null;
		latest: Date | null;
	};
	recentActivity: {
		last7Days: number;
		last30Days: number;
	};
}

export class AnalyticsService {
	/**
	 * Generate cache key for analytics
	 */
	private getCacheKey(
		datasetId: string,
		filters: AnalyticsFilters
	): string {
		return `analytics:${datasetId}:${JSON.stringify(filters)}`;
	}

	/**
	 * Build where clause for filters
	 */
	private buildWhereClause(
		datasetId: string,
		filters: AnalyticsFilters
	): any {
		const where: any = { datasetId };

		if (filters.startDate || filters.endDate) {
			where.date = {};
			if (filters.startDate) {
				where.date.gte = new Date(filters.startDate);
			}
			if (filters.endDate) {
				where.date.lte = new Date(filters.endDate);
			}
		}

		if (filters.category) {
			where.category = filters.category;
		}

		if (filters.product) {
			where.product = filters.product;
		}

		return where;
	}

	/**
	 * Get KPIs (Key Performance Indicators)
	 */
	async getKPIs(
		datasetId: string,
		organizationId: string,
		filters: AnalyticsFilters = {}
	): Promise<KPIs> {
		// Check cache first
		const cacheKey = this.getCacheKey(datasetId, {
			...filters,
			type: 'kpis',
		});

		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		// Verify dataset belongs to organization
		const dataset = await prisma.dataset.findFirst({
			where: { id: datasetId, organizationId },
		});

		if (!dataset) {
			throw new Error('Dataset not found');
		}

		// Build where clause
		const where = this.buildWhereClause(datasetId, filters);

		// Calculate KPIs
		const aggregations = await prisma.salesData.aggregate({
			where,
			_sum: {
				revenue: true,
				quantity: true,
			},
			_avg: {
				revenue: true,
			},
			_count: true,
		});

		const kpis: KPIs = {
			totalRevenue: aggregations._sum.revenue || 0,
			averageRevenue: aggregations._avg.revenue || 0,
			totalSales: aggregations._count || 0,
			totalQuantity: aggregations._sum.quantity || 0,
		};

		// Cache for 5 minutes
		await redis.setex(cacheKey, 300, JSON.stringify(kpis));

		return kpis;
	}

	/**
   * Get revenue over time with dynamic aggregation based on date range
   */
	async getRevenueByDate(
		datasetId: string,
		organizationId: string,
		filters: AnalyticsFilters = {}
	): Promise<RevenueByDate[]> {
		// Check cache
		const cacheKey = this.getCacheKey(datasetId, {
			...filters,
			type: 'revenue-by-date',
		});

		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		// Verify dataset
		const dataset = await prisma.dataset.findFirst({
			where: { id: datasetId, organizationId },
		});

		if (!dataset) {
			throw new Error('Dataset not found');
		}

		const where = this.buildWhereClause(datasetId, filters);

		// Get all sales data
		const results: { date: Date; revenue: number; quantity: number }[] = await prisma.salesData.findMany({
			where,
			select: {
				date: true,
				revenue: true,
				quantity: true,
			},
			orderBy: {
				date: 'asc',
			},
		});

		if (results.length === 0) {
			return [];
		}

		// Calculate date range in days
		const startDate = new Date(results[0].date);
		const endDate = new Date(results[results.length - 1].date);
		const daysDiff = Math.ceil(
			(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		// Determine aggregation level based on date range
		let aggregationLevel: 'day' | 'week' | 'month';
		if (daysDiff <= 31) {
			// 1 month or less: aggregate by day
			aggregationLevel = 'day';
		} else if (daysDiff <= 90) {
			// 3 months or less: aggregate by week
			aggregationLevel = 'week';
		} else {
			// More than 3 months: aggregate by month
			aggregationLevel = 'month';
		}

		// Group data based on aggregation level
		const groupedData: {
			[key: string]: { revenue: number; quantity: number };
		} = {};

		results.forEach((row) => {
			let key: string;

			switch (aggregationLevel) {
				case 'day':
					// Format: YYYY-MM-DD
					key = row.date.toISOString().split('T')[0];
					break;

				case 'week':
					// Get the Monday of the week
					const weekDate = new Date(row.date);
					const day = weekDate.getDay();
					const diff = weekDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
					weekDate.setDate(diff);
					key = weekDate.toISOString().split('T')[0];
					break;

				case 'month':
					// Format: YYYY-MM
					key = `${row.date.getFullYear()}-${String(row.date.getMonth() + 1).padStart(2, '0')}`;
					break;
			}

			if (!groupedData[key]) {
				groupedData[key] = { revenue: 0, quantity: 0 };
			}

			groupedData[key].revenue += row.revenue;
			groupedData[key].quantity += row.quantity;
		});

		// Convert to array
		const revenueByDate: RevenueByDate[] = Object.entries(groupedData)
			.map(([date, data]) => ({
				date,
				revenue: data.revenue,
				quantity: data.quantity,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));

		// Cache for 5 minutes
		await redis.setex(cacheKey, 300, JSON.stringify(revenueByDate));

		return revenueByDate;
	}

	/**
	 * Get revenue by category
	 */
	async getRevenueByCategory(
		datasetId: string,
		organizationId: string,
		filters: AnalyticsFilters = {}
	): Promise<RevenueByCategory[]> {
		const cacheKey = this.getCacheKey(datasetId, {
			...filters,
			type: 'revenue-by-category',
		});

		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		const dataset = await prisma.dataset.findFirst({
			where: { id: datasetId, organizationId },
		});

		if (!dataset) {
			throw new Error('Dataset not found');
		}

		const where = this.buildWhereClause(datasetId, filters);

		const results = await prisma.salesData.groupBy({
			by: ['category'],
			where,
			_sum: {
				revenue: true,
			},
			_count: true,
			orderBy: {
				_sum: {
					revenue: 'desc',
				},
			},
		});

		const revenueByCategory: RevenueByCategory[] = results
			.filter((r: { category: string | null; _sum: { revenue: number | null }; _count: number }) => r.category) // Remove null categories
			.map((r: { category: string | null; _sum: { revenue: number | null }; _count: number }) => ({
				category: r.category || 'Unknown',
				revenue: r._sum.revenue || 0,
				count: r._count,
			}));

		await redis.setex(cacheKey, 300, JSON.stringify(revenueByCategory));

		return revenueByCategory;
	}

	/**
	 * Get revenue by product
	 */
	async getRevenueByProduct(
		datasetId: string,
		organizationId: string,
		filters: AnalyticsFilters = {},
		limit: number = 10
	): Promise<RevenueByProduct[]> {
		const cacheKey = this.getCacheKey(datasetId, {
			...filters,
			type: 'revenue-by-product',
			limit,
		});

		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached);
		}

		const dataset = await prisma.dataset.findFirst({
			where: { id: datasetId, organizationId },
		});

		if (!dataset) {
			throw new Error('Dataset not found');
		}

		const where = this.buildWhereClause(datasetId, filters);

		const results = await prisma.salesData.groupBy({
			by: ['product'],
			where,
			_sum: {
				revenue: true,
				quantity: true,
			},
			orderBy: {
				_sum: {
					revenue: 'desc',
				},
			},
			take: limit,
		});

		const revenueByProduct: RevenueByProduct[] = results
			.filter((r: { product: string | null }) => r.product)
			.map((r: { product: string | null; _sum: { revenue: number | null; quantity: number | null } }) => ({
				product: r.product || 'Unknown',
				revenue: r._sum.revenue || 0,
				quantity: r._sum.quantity || 0,
			}));

		await redis.setex(cacheKey, 300, JSON.stringify(revenueByProduct));

		return revenueByProduct;
	}

	/**
	 * Get available filters (unique categories and products)
	 */
	async getAvailableFilters(
		datasetId: string,
		organizationId: string
	): Promise<{ categories: string[]; products: string[] }> {
		const dataset = await prisma.dataset.findFirst({
			where: { id: datasetId, organizationId },
		});

		if (!dataset) {
			throw new Error('Dataset not found');
		}

		const [categories, products] = await Promise.all([
			prisma.salesData.findMany({
				where: { datasetId, category: { not: null } },
				select: { category: true },
				distinct: ['category'],
			}),
			prisma.salesData.findMany({
				where: { datasetId, product: { not: null } },
				select: { product: true },
				distinct: ['product'],
			}),
		]);

		return {
			categories: categories
				.map((c: { category: string | null }) => c.category)
				.filter(Boolean) as string[],
			products: products.map((p: { product: string | null }) => p.product).filter(Boolean) as string[],
		};
	}

	/**
	 * Get overview stats for all datasets of an organization (DASHBOARD)
	 */
	async getOverview(organizationId: string): Promise<OverviewStats> {
		const datasets: { id: string; status: string; salesData: { revenue: number; quantity: number; date: Date }[] }[] = await prisma.dataset.findMany({
			where: { organizationId },
			include: {
				salesData: {
					select: {
						revenue: true,
						quantity: true,
						date: true,
					},
				},
			},
		});

		let totalRevenue = 0;
		let totalSales = 0;
		let earliestDate: Date | null = null;
		let latestDate: Date | null = null;
		let salesLast7Days = 0;
		let salesLast30Days = 0;

		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		datasets.forEach((dataset) => {
			dataset.salesData.forEach((sale) => {
				totalRevenue += sale.revenue;
				totalSales += sale.quantity;

				if (!earliestDate || sale.date < earliestDate) {
					earliestDate = sale.date;
				}
				if (!latestDate || sale.date > latestDate) {
					latestDate = sale.date;
				}

				if (sale.date >= sevenDaysAgo) {
					salesLast7Days += sale.quantity;
				}
				if (sale.date >= thirtyDaysAgo) {
					salesLast30Days += sale.quantity;
				}
			});
		});

		return {
			totalRevenue,
			totalSales,
			totalDatasets: datasets.length,
			datasetsReady: datasets.filter((d: { status: string }) => d.status === 'READY').length,
			dateRange: {
				earliest: earliestDate,
				latest: latestDate,
			},
			recentActivity: {
				last7Days: salesLast7Days,
				last30Days: salesLast30Days,
			},
		} as OverviewStats;
	}

	/**
	 * Get summary for each dataset with mini stats (DASHBOARD)
	 */
	async getDatasetsSummary(organizationId: string) {
		const datasets = await prisma.dataset.findMany({
			where: { organizationId },
			orderBy: { updatedAt: 'desc' },
			include: {
				salesData: {
					select: {
						revenue: true,
						quantity: true,
					},
				},
			},
		});

		return datasets.map((dataset: { id: string; name: string; status: string; rowCount: number; fileSize: number; createdAt: Date; updatedAt: Date; salesData: { revenue: number; quantity: number }[] }) => {
			const totalRevenue: number = dataset.salesData.reduce(
				(sum: number, sale: { revenue: number }) => sum + sale.revenue,
				0
			);
			const totalSales: number = dataset.salesData.reduce(
				(sum: number, sale: { quantity: number }) => sum + sale.quantity,
				0
			);
			const avgRevenue = totalSales > 0 ? totalRevenue / totalSales : 0;

			return {
				id: dataset.id,
				name: dataset.name,
				status: dataset.status,
				rowCount: dataset.rowCount,
				fileSize: dataset.fileSize,
				createdAt: dataset.createdAt,
				updatedAt: dataset.updatedAt,
				stats: {
					totalRevenue,
					totalSales,
					avgRevenue,
				},
			};
		});
	}

	/**
	 * Get trend data for sparkline chart - last 30 days (DASHBOARD)
	 */
	async getTrends(organizationId: string) {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const salesData = await prisma.salesData.findMany({
			where: {
				dataset: {
					organizationId,
				},
				date: {
					gte: thirtyDaysAgo,
				},
			},
			select: {
				date: true,
				revenue: true,
				quantity: true,
			},
			orderBy: {
				date: 'asc',
			},
		});

		const dataByDate = new Map<string, { revenue: number; sales: number }>();

		salesData.forEach((sale: { date: Date; revenue: number; quantity: number }) => {
			const dateKey: string = sale.date.toISOString().split('T')[0];
			const existing: { revenue: number; sales: number } = dataByDate.get(dateKey) || { revenue: 0, sales: 0 };
			dataByDate.set(dateKey, {
				revenue: existing.revenue + sale.revenue,
				sales: existing.sales + sale.quantity,
			});
		});

		const trends = [];
		const currentDate = new Date(thirtyDaysAgo);
		const today = new Date();

		while (currentDate <= today) {
			const dateKey = currentDate.toISOString().split('T')[0];
			const data = dataByDate.get(dateKey) || { revenue: 0, sales: 0 };

			trends.push({
				date: dateKey,
				revenue: data.revenue,
				sales: data.sales,
			});

			currentDate.setDate(currentDate.getDate() + 1);
		}

		return trends;
	}
}