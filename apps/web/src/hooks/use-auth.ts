import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { useAuthStore } from '../lib/store/auth';
import type { User } from '@salesscope/types';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const response = await apiClient.register(data);
      if (!response.success || !response.data) {
        throw new Error('Registration failed');
      }
      return response.data;
    },
    onSuccess: async (data) => {
      // Set access token
      apiClient.setAccessToken(data.accessToken);

      // Fetch user info
      const userResponse = await apiClient.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setAuth(data.accessToken, userResponse.data as User);
        router.push('/dashboard');
      }
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await apiClient.login(data);
      if (!response.success || !response.data) {
        throw new Error('Login failed');
      }
      return response.data;
    },
    onSuccess: async (data) => {
      // Set access token
      apiClient.setAccessToken(data.accessToken);

      // Fetch user info
      const userResponse = await apiClient.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setAuth(data.accessToken, userResponse.data as User);
        router.push('/dashboard');
      }
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      await apiClient.logout();
    },
    onSuccess: () => {
      apiClient.setAccessToken(null);
      clearAuth();
      router.push('/login');
    },
  });
}

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.getCurrentUser();
      if (!response.success) {
        throw new Error('Failed to fetch user');
      }
      return response.data as User;
    },
    enabled: !!accessToken,
  });
}
