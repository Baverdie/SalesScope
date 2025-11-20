import type { FastifyInstance } from 'fastify';
import { DatasetService } from './dataset.service.js';
import {
	uploadDatasetSchema,
	getDatasetSchema,
	listDatasetsSchema,
} from './dataset.schema.js';
import multipart from '@fastify/multipart';

export async function datasetRoutes(fastify: FastifyInstance) {
	const datasetService = new DatasetService();

	// Register multipart plugin for file uploads
	await fastify.register(multipart, {
		limits: {
			fileSize: 50 * 1024 * 1024, // 50MB max
			files: 1,
		},
	});

	/**
	 * Upload a dataset
	 * POST /api/datasets/upload
	 */
	fastify.post(
		'/upload',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const data = await request.file();

				if (!data) {
					return reply.code(400).send({
						success: false,
						error: {
							code: 'NO_FILE',
							message: 'No file uploaded',
						},
					});
				}

				// Validate file type
				if (
					data.mimetype !== 'text/csv' &&
					!data.filename.endsWith('.csv')
				) {
					return reply.code(400).send({
						success: false,
						error: {
							code: 'INVALID_FILE_TYPE',
							message: 'Only CSV files are allowed',
						},
					});
				}

				// Get file content
				const buffer = await data.toBuffer();
				const csvContent = buffer.toString('utf-8');

				// Get dataset name from fields or use filename
				const fields = data.fields as any;
				const name =
					fields?.name?.value || data.filename.replace('.csv', '');

				// Upload dataset
				const dataset = await datasetService.uploadDataset(
					request.user.organizationId,
					request.user.userId,
					name,
					csvContent,
					data.filename,
					buffer.length
				);

				return reply.code(201).send({
					success: true,
					data: dataset,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Dataset upload error');
				return reply.code(400).send({
					success: false,
					error: {
						code: 'UPLOAD_FAILED',
						message:
							err instanceof Error ? err.message : 'Upload failed',
					},
				});
			}
		}
	);

	/**
	 * List datasets
	 * GET /api/datasets
	 */
	fastify.get(
		'/',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const query = listDatasetsSchema.parse(request.query);
				const result = await datasetService.listDatasets(
					request.user.organizationId,
					query.page,
					query.limit
				);

				return reply.send({
					success: true,
					data: result.datasets,
					pagination: {
						page: query.page,
						limit: query.limit,
						total: result.total,
						totalPages: Math.ceil(result.total / query.limit),
					},
				});
			} catch (err) {
				fastify.log.error({ err }, 'List datasets error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'LIST_FAILED',
						message: 'Failed to list datasets',
					},
				});
			}
		}
	);

	/**
	 * Get dataset by ID
	 * GET /api/datasets/:datasetId
	 */
	fastify.get(
		'/:datasetId',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const params = getDatasetSchema.parse(request.params);
				const dataset = await datasetService.getDataset(
					params.datasetId,
					request.user.organizationId
				);

				if (!dataset) {
					return reply.code(404).send({
						success: false,
						error: {
							code: 'NOT_FOUND',
							message: 'Dataset not found',
						},
					});
				}

				return reply.send({
					success: true,
					data: dataset,
				});
			} catch (err) {
				fastify.log.error({ err }, 'Get dataset error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'GET_FAILED',
						message: 'Failed to get dataset',
					},
				});
			}
		}
	);

	/**
	 * Delete dataset
	 * DELETE /api/datasets/:datasetId
	 */
	fastify.delete(
		'/:datasetId',
		{
			onRequest: [fastify.authenticate],
		},
		async (request, reply) => {
			try {
				const params = getDatasetSchema.parse(request.params);
				await datasetService.deleteDataset(
					params.datasetId,
					request.user.organizationId
				);

				return reply.send({
					success: true,
					data: {
						message: 'Dataset deleted successfully',
					},
				});
			} catch (err) {
				fastify.log.error({ err }, 'Delete dataset error');
				return reply.code(500).send({
					success: false,
					error: {
						code: 'DELETE_FAILED',
						message:
							err instanceof Error ? err.message : 'Delete failed',
					},
				});
			}
		}
	);
}