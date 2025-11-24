'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatasetStats {
	totalRevenue: number;
	totalSales: number;
	avgRevenue: number;
}

interface Dataset {
	id: string;
	name: string;
	status: string;
	rowCount: number;
	fileSize: number;
	createdAt: Date;
	updatedAt: Date;
	stats: DatasetStats;
}

interface DashboardDatasetListProps {
	datasets: Dataset[];
}

export function DashboardDatasetList({ datasets }: DashboardDatasetListProps) {
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

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'READY':
				return 'bg-green-100 text-green-800';
			case 'PROCESSING':
				return 'bg-yellow-100 text-yellow-800';
			case 'FAILED':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	if (datasets.length === 0) {
		return null;
	}

	return (
		<div>
			<h2 className="text-xl font-semibold text-gray-900 mb-4">
				Your Datasets
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{datasets.map((dataset) => (
					<div
						key={dataset.id}
						className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow p-6 group"
					>
						{/* Header */}
						<div className="flex items-start justify-between mb-4">
							<div className="flex-1 min-w-0">
								<h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
									{dataset.name}
								</h3>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Clock className="w-4 h-4" />
									<span>{formatDate(dataset.updatedAt)}</span>
								</div>
							</div>
							<span
								className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
									dataset.status
								)}`}
							>
								{dataset.status}
							</span>
						</div>

						{/* Stats */}
						<div className="space-y-3 mb-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600">Revenue</span>
								<span className="text-sm font-semibold text-gray-900">
									{formatCurrency(dataset.stats.totalRevenue)}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600">Sales</span>
								<span className="text-sm font-semibold text-gray-900">
									{formatNumber(dataset.stats.totalSales)}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600">Avg Order</span>
								<span className="text-sm font-semibold text-gray-900">
									{formatCurrency(dataset.stats.avgRevenue)}
								</span>
							</div>
							<div className="flex items-center justify-between pt-2 border-t">
								<span className="text-xs text-gray-500">Data Points</span>
								<span className="text-xs font-medium text-gray-700">
									{formatNumber(dataset.rowCount)} rows
								</span>
							</div>
						</div>

						{/* Action */}
						{dataset.status === 'READY' && (
							<Link href={`/analytics/${dataset.id}`}>
								<Button className="w-full group-hover:bg-primary group-hover:text-white transition">
									<TrendingUp className="w-4 h-4 mr-2" />
									View Analytics
									<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
								</Button>
							</Link>
						)}

						{dataset.status === 'PROCESSING' && (
							<Button className="w-full" disabled>
								<span className="animate-pulse">Processing...</span>
							</Button>
						)}

						{dataset.status === 'FAILED' && (
							<Button className="w-full" variant="default" disabled>
								Processing Failed
							</Button>
						)}
					</div>
				))}
			</div>
		</div>
	);
}