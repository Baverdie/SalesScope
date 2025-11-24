import { z } from 'zod';

export const getAnalyticsSchema = z.object({
	datasetId: z.string().min(1, 'Dataset ID is required'),
});

export const getAnalyticsQuerySchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	category: z.string().optional(),
	product: z.string().optional(),
});

export type GetAnalyticsInput = z.infer<typeof getAnalyticsSchema>;
export type GetAnalyticsQuery = z.infer<typeof getAnalyticsQuerySchema>;