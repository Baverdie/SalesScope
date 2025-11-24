import type { FastifyInstance } from 'fastify';
import { AnalyticsService } from './analytics.service.js';
import {
	getAnalyticsSchema,
	getAnalyticsQuerySchema,
} from './analytics.schema.js';

export async function analyticsRoutes(fastify: FastifyInstance) {
	const analyticsService = new AnalyticsService();

	/**
	 * Get KPIs
	 * GET /api/analytics/:datasetId/kpis
	 */
	fastify.get(
		'/:datasetId/kpis',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const params = getAnalyticsSchema.parse(request.params);
				const query = getAnalyticsQuerySchema.parse(request.query);

				const kpis = await analyticsService.getKPIs(
					params.datasetId,
					request.user.organizationId,
					query
				);

				return reply.send({
					success: true,
					data: kpis,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get KPIs error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_KPIS_FAILED',
						message: err instanceof Error ? err.message : 'Failed to get KPIs',
					},
				});
			}
		}
	);

	/**
	 * Get revenue by date
	 * GET /api/analytics/:datasetId/revenue-by-date
	 */
	fastify.get(
		'/:datasetId/revenue-by-date',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const params = getAnalyticsSchema.parse(request.params);
				const query = getAnalyticsQuerySchema.parse(request.query);

				const data = await analyticsService.getRevenueByDate(
					params.datasetId,
					request.user.organizationId,
					query
				);

				return reply.send({
					success: true,
					data,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get revenue by date error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_REVENUE_BY_DATE_FAILED',
						message:
							err instanceof Error
								? err.message
								: 'Failed to get revenue by date',
					},
				});
			}
		}
	);

	/**
	 * Get revenue by category
	 * GET /api/analytics/:datasetId/revenue-by-category
	 */
	fastify.get(
		'/:datasetId/revenue-by-category',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const params = getAnalyticsSchema.parse(request.params);
				const query = getAnalyticsQuerySchema.parse(request.query);

				const data = await analyticsService.getRevenueByCategory(
					params.datasetId,
					request.user.organizationId,
					query
				);

				return reply.send({
					success: true,
					data,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get revenue by category error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_REVENUE_BY_CATEGORY_FAILED',
						message:
							err instanceof Error
								? err.message
								: 'Failed to get revenue by category',
					},
				});
			}
		}
	);

	/**
	 * Get revenue by product
	 * GET /api/analytics/:datasetId/revenue-by-product
	 */
	fastify.get(
		'/:datasetId/revenue-by-product',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const params = getAnalyticsSchema.parse(request.params);
				const query = getAnalyticsQuerySchema.parse(request.query);

				const data = await analyticsService.getRevenueByProduct(
					params.datasetId,
					request.user.organizationId,
					query,
					10
				);

				return reply.send({
					success: true,
					data,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get revenue by product error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_REVENUE_BY_PRODUCT_FAILED',
						message:
							err instanceof Error
								? err.message
								: 'Failed to get revenue by product',
					},
				});
			}
		}
	);

	/**
	 * Get available filters
	 * GET /api/analytics/:datasetId/filters
	 */
	fastify.get(
		'/:datasetId/filters',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const params = getAnalyticsSchema.parse(request.params);

				const filters = await analyticsService.getAvailableFilters(
					params.datasetId,
					request.user.organizationId
				);

				return reply.send({
					success: true,
					data: filters,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get filters error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_FILTERS_FAILED',
						message:
							err instanceof Error ? err.message : 'Failed to get filters',
					},
				});
			}
		}
	);

	/**
	 * Get overview stats for all datasets (DASHBOARD)
	 * GET /api/analytics/overview
	 */
	fastify.get(
		'/overview',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const overview = await analyticsService.getOverview(
					request.user.organizationId
				);

				return reply.send({
					success: true,
					data: overview,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get overview error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_OVERVIEW_FAILED',
						message: 'Failed to get overview',
					},
				});
			}
		}
	);

	/**
	 * Get summary for all datasets (DASHBOARD)
	 * GET /api/analytics/datasets-summary
	 */
	fastify.get(
		'/datasets-summary',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const datasets = await analyticsService.getDatasetsSummary(
					request.user.organizationId
				);

				return reply.send({
					success: true,
					data: datasets,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get datasets summary error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_DATASETS_FAILED',
						message: 'Failed to get datasets',
					},
				});
			}
		}
	);

	/**
	 * Get trend data (DASHBOARD)
	 * GET /api/analytics/trends
	 */
	fastify.get(
		'/trends',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const trends = await analyticsService.getTrends(
					request.user.organizationId
				);

				return reply.send({
					success: true,
					data: trends,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get trends error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_TRENDS_FAILED',
						message: 'Failed to get trends',
					},
				});
			}
		}
	);
}