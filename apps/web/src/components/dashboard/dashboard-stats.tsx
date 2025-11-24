'use client';

import { TrendingUp, ShoppingCart, Database, Calendar } from 'lucide-react';

interface OverviewData {
	totalRevenue?: number;
	totalSales?: number;
	totalDatasets?: number;
	datasetsReady?: number;
	// l'API peut renvoyer des dates sous forme de string ou Date
	dateRange?: {
		earliest?: string | Date | null;
		latest?: string | Date | null;
	};
	recentActivity?: {
		last7Days?: number;
		last30Days?: number;
	};
}

interface DashboardStatsProps {
	overview?: OverviewData | null;
}

export function DashboardStats({ overview }: DashboardStatsProps) {
	if (!overview) return null;
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	const formatNumber = (value: number) => {
		return new Intl.NumberFormat('en-US').format(value);
	};

	const formatDateRange = () => {
		const earliestRaw = overview?.dateRange?.earliest;
		const latestRaw = overview?.dateRange?.latest;

		if (!earliestRaw || !latestRaw) return 'No data';

		const earliest = new Date(earliestRaw).toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric',
		});
		const latest = new Date(latestRaw).toLocaleDateString('en-US', {
			month: 'short',
			year: 'numeric',
		});

		return `${earliest} - ${latest}`;
	};

	const stats = [
		{
			label: 'Total Revenue',
			value: formatCurrency(overview.totalRevenue ?? 0),
			icon: TrendingUp,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
			subtext: `${formatNumber(overview.recentActivity?.last30Days ?? 0)} sales last 30 days`,
		},
		{
			label: 'Total Sales',
			value: formatNumber(overview.totalSales ?? 0),
			icon: ShoppingCart,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			subtext: `${formatNumber(overview.recentActivity?.last7Days ?? 0)} sales last 7 days`,
		},
		{
			label: 'Datasets',
			value: `${overview.datasetsReady ?? 0}/${overview.totalDatasets ?? 0}`,
			icon: Database,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
			subtext: `${overview.datasetsReady ?? 0} ready to analyze`,
		},
		{
			label: 'Data Period',
			value: formatDateRange(),
			icon: Calendar,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
			subtext: 'Date range covered',
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div
						key={stat.label}
						className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
					>
						<div className="flex items-center justify-between mb-4">
							<div className={`${stat.bgColor} p-3 rounded-lg`}>
								<Icon className={`w-6 h-6 ${stat.color}`} />
							</div>
						</div>
						<div>
							<p className="text-sm text-gray-600 mb-1">{stat.label}</p>
							<p className="text-2xl font-bold text-gray-900">{stat.value}</p>
							<p className="text-xs text-gray-500 mt-2">{stat.subtext}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}