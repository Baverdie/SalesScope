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
import { Upload } from 'lucide-react';

export default function DashboardPage() {
	const { user, isAuthenticated } = useAuthStore();
	const logout = useLogout();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	// Wait for component to mount (client-side only)
	useEffect(() => {
		setMounted(true);
	}, []);

	// Redirect only after mount
	useEffect(() => {
		if (mounted && !isAuthenticated) {
			router.push('/login');
		}
	}, [mounted, isAuthenticated, router]);

	// Fetch overview stats
	const { data: overview, isLoading: overviewLoading } = useQuery({
		queryKey: ['analytics', 'overview'],
		queryFn: async () => {
			const response = await apiClient.getOverview();
			return response.data;
		},
		enabled: mounted && isAuthenticated,
	});

	// Fetch datasets summary
	const { data: datasets, isLoading: datasetsLoading } = useQuery<Array<any>>({
		queryKey: ['analytics', 'datasets-summary'],
		queryFn: async (): Promise<any[]> => {
			const response = await apiClient.getDatasetsSummary();
			return response.data as any[];
		},
		enabled: mounted && isAuthenticated,
	});

	// Fetch trends
	const { data: trends, isLoading: trendsLoading } = useQuery<Array<any>>({
		queryKey: ['analytics', 'trends'],
		queryFn: async (): Promise<any[]> => {
			const response = await apiClient.getTrends();
			return response.data as any[];
		},
		enabled: mounted && isAuthenticated,
	});

	// Don't render anything until mounted
	if (!mounted) {
		return null;
	}

	// Show loading if not authenticated
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
						<div className="flex items-center space-x-8">
							<Link href="/dashboard">
								<h1 className="text-2xl font-bold text-indigo-600">
									SalesScope
								</h1>
							</Link>
							<nav className="flex space-x-4">
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
						<div className="flex items-center space-x-4">
							<span className="text-sm text-gray-700">
								Welcome, {user.name}!
							</span>
							<Button
								variant="outline"
								onClick={() => logout.mutate()}
								disabled={logout.isPending}
							>
								{logout.isPending ? 'Logging out...' : 'Logout'}
							</Button>
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
							<p className="text-gray-600 mt-1">
								Overview of all your sales data
							</p>
						</div>
						<Link href="/datasets">
							<Button>
								<Upload className="w-4 h-4 mr-2" />
								Upload CSV
							</Button>
						</Link>
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="animate-pulse space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="h-32 bg-gray-200 rounded"></div>
								))}
							</div>
							<div className="h-64 bg-gray-200 rounded"></div>
							<div className="grid grid-cols-3 gap-6">
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
								<div className="mb-8">
									<div className="bg-white rounded-lg shadow p-6">
										<h3 className="text-lg font-semibold mb-4">
											Revenue Trend (Last 30 Days)
										</h3>
										<TrendChart data={trends} />
									</div>
								</div>
							)}

							{/* Datasets List */}
							{datasets && datasets.length > 0 && (
								<DashboardDatasetList datasets={datasets} />
							)}

							{/* Empty State */}
							{datasets && datasets.length === 0 && (
								<div className="bg-white rounded-lg shadow p-12 text-center">
									<Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										No datasets yet
									</h3>
									<p className="text-gray-600 mb-6">
										Upload your first CSV file to start analyzing your sales data
									</p>
									<Link href="/datasets">
										<Button size="lg">
											<Upload className="w-5 h-5 mr-2" />
											Upload Your First Dataset
										</Button>
									</Link>
								</div>
							)}
						</>
					)}
				</div>
			</main>
		</div>
	);
}