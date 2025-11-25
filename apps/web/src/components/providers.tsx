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
    useAuthStore.persist.rehydrate();
    const initializeAuth = async () => {
      const accessToken = useAuthStore.getState().accessToken;

      if (accessToken) {
        // Restaurer le token dans l'apiClient
        apiClient.setAccessToken(accessToken);

        // Essayer de refresh le token au cas où il serait expiré
        try {
          const response = await apiClient.refresh();
          if (response.success && response.data) {
            const newToken = response.data.accessToken;
            apiClient.setAccessToken(newToken);

            // Mettre à jour le store avec le nouveau token
            const userResponse = await apiClient.getCurrentUser();
            if (userResponse.success && userResponse.data) {
              useAuthStore.getState().setTokens(newToken, ''); // Le refresh token est déjà dans le store
              useAuthStore.getState().setUser(userResponse.data as any);
            }
          }
        } catch (error) {
          // Si le refresh échoue, clear l'auth
          console.error('Failed to refresh token on mount:', error);
          useAuthStore.getState().logout();
          apiClient.setAccessToken(null);
        }
      }
    };

    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}