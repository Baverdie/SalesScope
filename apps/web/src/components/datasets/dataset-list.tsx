'use client';

import { useDatasets, useDeleteDataset } from '@/hooks/use-datasets';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function DatasetList() {
	const { data, isLoading, error } = useDatasets();
	const deleteDataset = useDeleteDataset();

	if (isLoading) {
		return (
			<div className="bg-white rounded-lg shadow p-6">
				<p className="text-gray-500">Loading datasets...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-lg shadow p-6">
				<p className="text-red-600">Failed to load datasets</p>
			</div>
		);
	}

	// FIX: data is already the array, not data.datasets
	const datasets = Array.isArray(data) ? data : [];

	if (datasets.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow p-6">
				<p className="text-gray-500 text-center">
					No datasets yet. Upload your first CSV file to get started!
				</p>
			</div>
		);
	}

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

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
	};

	return (
		<div className="bg-white rounded-lg shadow overflow-hidden">
			<div className="px-6 py-4 border-b border-gray-200">
				<h3 className="text-lg font-semibold">Your Datasets</h3>
			</div>
			<div className="divide-y divide-gray-200">
				{datasets.map((dataset) => (
					<div
						key={dataset.id}
						className="px-6 py-4 hover:bg-gray-50 transition"
					>
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<div className="flex items-center space-x-3">
									<h4 className="text-base font-medium text-gray-900">
										{dataset.name}
									</h4>
									<span
										className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
											dataset.status
										)}`}
									>
										{dataset.status}
									</span>
								</div>
								<div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
									<span>{dataset.fileName}</span>
									<span>•</span>
									<span>{formatFileSize(dataset.fileSize)}</span>
									<span>•</span>
									<span>{dataset.rowCount.toLocaleString()} rows</span>
									<span>•</span>
									<span>Uploaded {formatDate(dataset.createdAt)}</span>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								{dataset.status === 'READY' && (
									<Link href={`/analytics/${dataset.id}`}>
										<Button variant="default" size="sm">
											View Analytics
										</Button>
									</Link>
								)}
								<Button
									variant="outline"
									size="sm"
									onClick={() => deleteDataset.mutate(dataset.id)}
									disabled={deleteDataset.isPending}
								>
									{deleteDataset.isPending ? 'Deleting...' : 'Delete'}
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}