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
import { Menu, X } from 'lucide-react';

export default function DatasetsPage() {
	const { user, isAuthenticated } = useAuthStore();
	const logout = useLogout();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { refetch } = useDatasets();

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
									className="text-indigo-600 px-3 py-2 rounded-md text-sm font-medium bg-indigo-50"
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
								className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
								onClick={() => setMobileMenuOpen(false)}
							>
								Dashboard
							</Link>
							<Link
								href="/datasets"
								className="block text-indigo-600 px-3 py-2 rounded-md text-base font-medium bg-indigo-50"
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

			<main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
					Manage Your Datasets
				</h2>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
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
			</main>
		</div>
	);
}