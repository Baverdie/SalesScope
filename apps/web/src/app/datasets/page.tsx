'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useLogout } from '@/hooks/use-auth';
import { useDatasets } from '@/hooks/use-datasets';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CSVUploader } from '@/components/datasets/csv-uploader';
import { DatasetList } from '@/components/datasets/dataset-list';

export default function DatasetsPage() {
	const { user, isAuthenticated } = useAuthStore();
	const logout = useLogout();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const { refetch } = useDatasets();

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

	// Don't render anything until mounted
	if (!mounted) {
		return null;
	}

	// Show loading if not authenticated
	if (!isAuthenticated || !user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
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
									className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
								>
									Dashboard
								</Link>
								<Link
									href="/datasets"
									className="text-indigo-600 px-3 py-2 rounded-md text-sm font-medium bg-indigo-50"
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

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<h2 className="text-3xl font-bold text-gray-900 mb-8">
						Manage Your Datasets
					</h2>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-1">
							<CSVUploader
								onSuccess={() => {
									refetch();
								}}
							/>
						</div>

						<div className="lg:col-span-2">
							<DatasetList />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}