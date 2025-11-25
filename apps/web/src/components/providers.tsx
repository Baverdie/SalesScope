'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Ne pas retry sur 401 (unauthorized)
              if (error?.response?.status === 401) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  // 🔧 FIX : Initialiser l'apiClient au mount
  useEffect(() => {
    // Hydrate from sessionStorage
    const accessToken = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    const userStr = sessionStorage.getItem('user');

    if (accessToken && userStr) {
      const user = JSON.parse(userStr);
      useAuthStore.setState({
        accessToken,
        refreshToken: refreshToken || '',
        user,
        isAuthenticated: true,
        _hasHydrated: true,
      });

      // Restore token in apiClient
      apiClient.setAccessToken(accessToken);
    } else {
      useAuthStore.setState({ _hasHydrated: true });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}