'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DashboardDatasetList } from '@/components/dashboard/dashboard-dataset-list';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { Upload, Menu, X } from 'lucide-react';

export default function DashboardPage() {
	const { user, isAuthenticated } = useAuthStore();
	const logout = useLogout();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted && !isAuthenticated) {
			router.push('/login');
		}
	}, [mounted, isAuthenticated, router]);

	const { data: overview, isLoading: overviewLoading } = useQuery({
		queryKey: ['analytics', 'overview'],
		queryFn: async () => {
			const response = await apiClient.getOverview();
			return response.data;
		},
		enabled: mounted && isAuthenticated,
	});

	const { data: datasets, isLoading: datasetsLoading } = useQuery<Array<any>>({
		queryKey: ['analytics', 'datasets-summary'],
		queryFn: async (): Promise<any[]> => {
			const response = await apiClient.getDatasetsSummary();
			return response.data as any[];
		},
		enabled: mounted && isAuthenticated,
	});

	const { data: trends, isLoading: trendsLoading } = useQuery<Array<any>>({
		queryKey: ['analytics', 'trends'],
		queryFn: async (): Promise<any[]> => {
			const response = await apiClient.getTrends();
			return response.data as any[];
		},
		enabled: mounted && isAuthenticated,
	});

	if (!mounted) {
		return null;
	}

	if (!isAuthenticated || !user) {
		return null;
	}

	const isLoading = overviewLoading || datasetsLoading || trendsLoading;

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
									className="text-indigo-600 px-3 py-2 rounded-md text-sm font-medium bg-indigo-50"
								>
									Dashboard
								</Link>
								<Link
									href="/datasets"
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									Datasets
								</Link>
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
								className="block text-indigo-600 px-3 py-2 rounded-md text-base font-medium bg-indigo-50"
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

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
					<div>
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h2>
						<p className="text-gray-600 mt-1 text-sm sm:text-base">
							Overview of all your sales data
						</p>
					</div>
					<Link href="/datasets">
						<Button className="w-full sm:w-auto">
							<Upload className="w-4 h-4 mr-2" />
							Upload CSV
						</Button>
					</Link>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="animate-pulse space-y-6 sm:space-y-8">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="h-32 bg-gray-200 rounded"></div>
							))}
						</div>
						<div className="h-64 bg-gray-200 rounded"></div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-48 bg-gray-200 rounded"></div>
							))}
						</div>
					</div>
				)}

				{/* Content */}
				{!isLoading && (
					<>
						{/* Stats Overview */}
						{overview && <DashboardStats overview={overview} />}

						{/* Trend Chart */}
						{trends && trends.length > 0 && (
							<div className="mb-6 sm:mb-8">
								<div className="bg-white rounded-lg shadow p-4 sm:p-6">
									<h3 className="text-base sm:text-lg font-semibold mb-4">
										Revenue Trend (Last 30 Days)
									</h3>
									<div className="overflow-x-auto">
										<TrendChart data={trends} />
									</div>
								</div>
							</div>
						)}

						{/* Datasets List */}
						{datasets && datasets.length > 0 && (
							<DashboardDatasetList datasets={datasets} />
						)}

						{/* Empty State */}
						{datasets && datasets.length === 0 && (
							<div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
								<Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
								<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
									No datasets yet
								</h3>
								<p className="text-sm sm:text-base text-gray-600 mb-6">
									Upload your first CSV file to start analyzing your sales data
								</p>
								<Link href="/datasets">
									<Button size="lg" className="w-full sm:w-auto">
										<Upload className="w-5 h-5 mr-2" />
										Upload Your First Dataset
									</Button>
								</Link>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
}