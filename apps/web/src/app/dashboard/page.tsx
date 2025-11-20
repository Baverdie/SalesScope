'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-indigo-600">
                SalesScope
              </h1>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p className="text-gray-600 mb-4">
              Welcome to your SalesScope dashboard! 🎉
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                What's next?
              </h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Upload your first CSV file</li>
                <li>View analytics and insights</li>
                <li>Generate reports</li>
                <li>Invite team members</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}