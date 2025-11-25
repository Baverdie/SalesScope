'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { useLogout } from '@/hooks/use-auth';
import { useDataset } from '@/hooks/use-datasets';
import {
	useKPIs,
	useRevenueByDate,
	useRevenueByCategory,
	useRevenueByProduct,
	useAvailableFilters,
} from '@/hooks/use-analytics';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/analytics/kpi-card';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { CategoryChart } from '@/components/analytics/category-chart';
import { ProductChart } from '@/components/analytics/product-chart';
import { DateFilter } from '@/components/analytics/date-filter';
import { CategoryFilter } from '@/components/analytics/category-filter';
import { ProductFilter } from '@/components/analytics/product-filter';
import { getDateRange } from '@/lib/format';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { X, Download, Menu } from 'lucide-react';
import { exportAnalyticsToPDF } from '@/lib/export-pdf';

export default function AnalyticsPage() {
	const params = useParams();
	const router = useRouter();
	const { user, isAuthenticated } = useAuthStore();
	const logout = useLogout();
	const [mounted, setMounted] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Filters state
	const [dateFilter, setDateFilter] = useState('all');
	const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
	const [productFilter, setProductFilter] = useState<string | undefined>(undefined);
	const [isExporting, setIsExporting] = useState(false);

	const handleExportPDF = async () => {
		if (!dataset) return;

		setIsExporting(true);
		try {
			await exportAnalyticsToPDF({
				datasetName: dataset.name,
				fileName: `${dataset.name.replace(/\s+/g, '_')}_analytics.pdf`,
				filters: {
					dateFilter,
					category: categoryFilter,
					product: productFilter,
				},
			});
		} catch (error) {
			console.error('Failed to export PDF:', error);
			alert('Failed to export PDF. Please try again.');
		} finally {
			setIsExporting(false);
		}
	};

	const datasetId = params.datasetId as string;
	const dateRange = getDateRange(dateFilter);

	// Combine all filters
	const filters = {
		...dateRange,
		category: categoryFilter,
		product: productFilter,
	};

	const { data: dataset, isLoading: datasetLoading } = useDataset(datasetId);
	const { data: availableFilters, isLoading: filtersLoading } = useAvailableFilters(datasetId);
	const { data: kpis, isLoading: kpisLoading } = useKPIs(datasetId, filters);
	const { data: revenueByDate, isLoading: revenueByDateLoading } =
		useRevenueByDate(datasetId, filters);
	const { data: revenueByCategory, isLoading: revenueByCategoryLoading } =
		useRevenueByCategory(datasetId, filters);
	const { data: revenueByProduct, isLoading: revenueByProductLoading } =
		useRevenueByProduct(datasetId, filters);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted && !isAuthenticated) {
			router.push('/login');
		}
	}, [mounted, isAuthenticated, router]);

	if (!mounted) {
		return null;
	}

	if (!isAuthenticated || !user) {
		return null;
	}

	const isLoading =
		datasetLoading ||
		kpisLoading ||
		revenueByDateLoading ||
		revenueByCategoryLoading ||
		revenueByProductLoading;

	const hasActiveFilters = dateFilter !== 'all' || categoryFilter || productFilter;

	const clearFilters = () => {
		setDateFilter('all');
		setCategoryFilter(undefined);
		setProductFilter(undefined);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navbar */}
			<nav className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						{/* Logo + Nav Desktop */}
						<div className="flex items-center space-x-8">
							<Link href="/dashboard">
								<h1 className="text-xl sm:text-2xl font-bold text-indigo-600">
									SalesScope
								</h1>
							</Link>
							{/* Desktop Nav */}
							<nav className="hidden md:flex space-x-4">
								<Link
									href="/dashboard"
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									Dashboard
								</Link>
								<Link
									href="/datasets"
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									Datasets
								</Link>
								<span className="text-indigo-600 px-3 py-2 rounded-md text-sm font-medium bg-indigo-50">
									Analytics
								</span>
							</nav>
						</div>

						{/* Desktop User + Logout */}
						<div className="hidden md:flex items-center space-x-4">
							<span className="text-sm text-gray-700">
								Welcome, {user.name}!
							</span>
							<Button
								variant="outline"
								onClick={() => logout.mutate()}
								disabled={logout.isPending}
								size="sm"
							>
								{logout.isPending ? 'Logging out...' : 'Logout'}
							</Button>
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden flex items-center">
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="text-gray-600 hover:text-gray-900"
							>
								{mobileMenuOpen ? (
									<X className="w-6 h-6" />
								) : (
									<Menu className="w-6 h-6" />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t border-gray-200">
						<div className="px-2 pt-2 pb-3 space-y-1">
							<Link
								href="/dashboard"
								className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
								onClick={() => setMobileMenuOpen(false)}
							>
								Dashboard
							</Link>
							<Link
								href="/datasets"
								className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
								onClick={() => setMobileMenuOpen(false)}
							>
								Datasets
							</Link>
							<span className="block text-indigo-600 px-3 py-2 rounded-md text-base font-medium bg-indigo-50">
								Analytics
							</span>
						</div>
						<div className="pt-4 pb-3 border-t border-gray-200">
							<div className="flex items-center px-5 mb-3">
								<span className="text-sm text-gray-700">
									Welcome, {user.name}!
								</span>
							</div>
							<div className="px-5">
								<Button
									variant="outline"
									onClick={() => {
										logout.mutate();
										setMobileMenuOpen(false);
									}}
									disabled={logout.isPending}
									className="w-full"
								>
									{logout.isPending ? 'Logging out...' : 'Logout'}
								</Button>
							</div>
						</div>
					</div>
				)}
			</nav>

			<main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<Link
								href="/datasets"
								className="text-indigo-600 hover:text-indigo-500 text-sm font-medium inline-block mb-2"
							>
								← Back to Datasets
							</Link>
							<h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
								{dataset?.name || 'Analytics'}
							</h2>
							<p className="text-sm sm:text-base text-gray-600 mt-1">
								{dataset?.fileName} • {dataset?.rowCount} rows
							</p>
						</div>
						<Button
							onClick={handleExportPDF}
							disabled={isExporting || isLoading}
							size="lg"
							className="w-full sm:w-auto"
						>
							<Download className="w-4 h-4 mr-2" />
							{isExporting ? 'Exporting...' : 'Export PDF'}
						</Button>
					</div>
				</div>

				{/* Filters */}
				<div className="mb-6 bg-white rounded-lg shadow p-4 space-y-4">
					<div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4">
						<DateFilter selected={dateFilter} onChange={setDateFilter} />

						{!filtersLoading && availableFilters && (
							<>
								<CategoryFilter
									categories={availableFilters.categories}
									selected={categoryFilter}
									onChange={setCategoryFilter}
								/>

								<ProductFilter
									products={availableFilters.products}
									selected={productFilter}
									onChange={setProductFilter}
								/>
							</>
						)}

						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="w-full sm:w-auto sm:ml-auto"
							>
								<X className="w-4 h-4 mr-1" />
								Clear Filters
							</Button>
						)}
					</div>

					{/* Active Filters Display */}
					{hasActiveFilters && (
						<div className="flex flex-wrap gap-2 pt-2 border-t">
							<span className="text-sm text-gray-600">Active filters:</span>
							{dateFilter !== 'all' && (
								<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
									{dateFilter === '12m' && 'Last 12 Months'}
									{dateFilter === '6m' && 'Last 6 Months'}
									{dateFilter === '3m' && 'Last 3 Months'}
									{dateFilter === '1m' && 'Last Month'}
								</span>
							)}
							{categoryFilter && (
								<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
									Category: {categoryFilter}
								</span>
							)}
							{productFilter && (
								<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									Product: {productFilter}
								</span>
							)}
						</div>
					)}
				</div>

				{isLoading ? (
					<div className="text-center py-12">
						<p className="text-gray-500">Loading analytics...</p>
					</div>
				) : (
					<div className="space-y-6">
						{/* KPIs */}
						<div id="kpis-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
							<KPICard
								title="Total Revenue"
								value={`$${kpis?.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
							/>
							<KPICard
								title="Average Revenue"
								value={`$${kpis?.averageRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
							/>
							<KPICard
								title="Total Sales"
								value={kpis?.totalSales.toLocaleString() || '0'}
							/>
							<KPICard
								title="Total Quantity"
								value={kpis?.totalQuantity.toLocaleString() || '0'}
							/>
						</div>

						{/* Revenue Over Time */}
						{revenueByDate && revenueByDate.length > 0 && (
							<div id="revenue-chart" className="overflow-x-auto">
								<RevenueChart data={revenueByDate} />
							</div>
						)}

						{/* Revenue by Category and Product */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{revenueByCategory && revenueByCategory.length > 0 && (
								<div id="category-chart" className="overflow-x-auto">
									<CategoryChart data={revenueByCategory} />
								</div>
							)}
							{revenueByProduct && revenueByProduct.length > 0 && (
								<div id="product-chart" className="overflow-x-auto">
									<ProductChart data={revenueByProduct} />
								</div>
							)}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}