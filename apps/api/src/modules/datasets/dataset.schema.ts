import { z } from 'zod';

export const uploadDatasetSchema = z.object({
	name: z.string().min(1, 'Dataset name is required').max(255),
	file: z.any(), // File will be validated separately
});

export const getDatasetSchema = z.object({
	datasetId: z.string().cuid('Invalid dataset ID'),
});

export const listDatasetsSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export type UploadDatasetInput = z.infer<typeof uploadDatasetSchema>;
export type GetDatasetInput = z.infer<typeof getDatasetSchema>;
export type ListDatasetsInput = z.infer<typeof listDatasetsSchema>;