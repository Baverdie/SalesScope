import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { Dataset } from '@salesscope/types';

export function useUploadDataset() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { name: string; file: File }) => {
			const formData = new FormData();
			formData.append('file', data.file);
			formData.append('name', data.name);

			const response = await apiClient.uploadDataset(formData);
			if (!response.success) {
				throw new Error('Upload failed');
			}
			return response.data as Dataset;
		},
		onSuccess: () => {
			// Invalidate datasets list
			queryClient.invalidateQueries({ queryKey: ['datasets'] });
		},
	});
}

export function useDatasets(page: number = 1, limit: number = 20) {
	return useQuery({
		queryKey: ['datasets', page, limit],
		queryFn: async () => {
			const response = await apiClient.listDatasets(page, limit);
			if (!response.success) {
				throw new Error('Failed to fetch datasets');
			}
			return response.data as {
				datasets: Dataset[];
				pagination: {
					page: number;
					limit: number;
					total: number;
					totalPages: number;
				};
			};
		},
	});
}

export function useDataset(datasetId: string) {
	return useQuery({
		queryKey: ['dataset', datasetId],
		queryFn: async () => {
			const response = await apiClient.getDataset(datasetId);
			if (!response.success) {
				throw new Error('Failed to fetch dataset');
			}
			return response.data as Dataset;
		},
		enabled: !!datasetId,
	});
}

export function useDeleteDataset() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (datasetId: string) => {
			const response = await apiClient.deleteDataset(datasetId);
			if (!response.success) {
				throw new Error('Delete failed');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['datasets'] });
		},
	});
}