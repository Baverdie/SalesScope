import { prisma } from '../../utils/db.js';
import Papa from 'papaparse';
import type { Dataset, SalesData, ColumnType } from '@salesscope/types';

interface ParsedCSVRow {
	[key: string]: string;
}

interface DatasetColumn {
	name: string;
	type: ColumnType;
	nullable: boolean;
}

export class DatasetService {
	/**
	 * Parse CSV file and detect column types
	 */
	private parseCSV(csvContent: string): {
		data: ParsedCSVRow[];
		columns: DatasetColumn[];
	} {
		const parsed = Papa.parse<ParsedCSVRow>(csvContent, {
			header: true,
			skipEmptyLines: true,
			transformHeader: (header) => header.trim(),
		});

		if (parsed.errors.length > 0) {
			throw new Error(
				`CSV parsing error: ${parsed.errors[0].message}`
			);
		}

		const data = parsed.data;
		if (data.length === 0) {
			throw new Error('CSV file is empty');
		}

		// Detect column types from first few rows
		const columns = this.detectColumnTypes(data);

		return { data, columns };
	}

	/**
	 * Detect column types by analyzing data
	 */
	private detectColumnTypes(data: ParsedCSVRow[]): DatasetColumn[] {
		const headers = Object.keys(data[0]);
		const sampleSize = Math.min(100, data.length);

		return headers.map((header) => {
			let isNumber = true;
			let isDate = true;
			let hasNull = false;

			for (let i = 0; i < sampleSize; i++) {
				const value = data[i][header];

				if (!value || value.trim() === '') {
					hasNull = true;
					continue;
				}

				// Check if it's a number
				if (isNumber && isNaN(Number(value))) {
					isNumber = false;
				}

				// Check if it's a date
				if (isDate) {
					const date = new Date(value);
					if (isNaN(date.getTime())) {
						isDate = false;
					}
				}
			}

			let type: ColumnType = 'STRING' as ColumnType;
			if (isDate) {
				type = 'DATE' as ColumnType;
			} else if (isNumber) {
				type = 'NUMBER' as ColumnType;
			}

			return {
				name: header,
				type,
				nullable: hasNull,
			};
		});
	}

	/**
	 * Validate CSV structure for sales data
	 */
	private validateSalesData(
		data: ParsedCSVRow[],
		columns: DatasetColumn[]
	): void {
		const columnNames = columns.map((c) => c.name.toLowerCase());

		// Check for required columns (flexible naming)
		const hasDate =
			columnNames.includes('date') ||
			columnNames.includes('transaction_date') ||
			columnNames.includes('order_date');

		const hasRevenue =
			columnNames.includes('revenue') ||
			columnNames.includes('amount') ||
			columnNames.includes('total') ||
			columnNames.includes('price');

		const hasQuantity =
			columnNames.includes('quantity') ||
			columnNames.includes('qty') ||
			columnNames.includes('amount');

		if (!hasDate) {
			throw new Error(
				'CSV must contain a date column (date, transaction_date, or order_date)'
			);
		}

		if (!hasRevenue) {
			throw new Error(
				'CSV must contain a revenue column (revenue, amount, total, or price)'
			);
		}
	}

	/**
	 * Map CSV row to SalesData format
	 */
	private mapToSalesData(
		row: ParsedCSVRow,
		columns: DatasetColumn[]
	): Partial<SalesData> {
		const columnNames = columns.map((c) => c.name.toLowerCase());
		const mapping: { [key: string]: string } = {};

		// Find column indices
		columns.forEach((col) => {
			mapping[col.name.toLowerCase()] = col.name;
		});

		// Extract date
		let dateValue: Date;
		const dateCol =
			mapping['date'] ||
			mapping['transaction_date'] ||
			mapping['order_date'];
		if (dateCol) {
			dateValue = new Date(row[dateCol]);
		} else {
			dateValue = new Date();
		}

		// Extract revenue
		let revenueValue = 0;
		const revenueCol =
			mapping['revenue'] ||
			mapping['amount'] ||
			mapping['total'] ||
			mapping['price'];
		if (revenueCol) {
			revenueValue = parseFloat(row[revenueCol]) || 0;
		}

		// Extract quantity
		let quantityValue = 1;
		const quantityCol =
			mapping['quantity'] || mapping['qty'] || mapping['amount'];
		if (quantityCol) {
			quantityValue = parseInt(row[quantityCol]) || 1;
		}

		// Extract optional fields
		const product =
			row[mapping['product']] ||
			row[mapping['product_name']] ||
			row[mapping['item']] ||
			undefined;

		const category =
			row[mapping['category']] ||
			row[mapping['product_category']] ||
			undefined;

		return {
			date: dateValue.toISOString(),
			revenue: revenueValue,
			quantity: quantityValue,
			product,
			category,
		};
	}

	/**
	 * Upload and process a CSV dataset
	 */
	async uploadDataset(
		organizationId: string,
		userId: string,
		name: string,
		csvContent: string,
		fileName: string,
		fileSize: number
	): Promise<Dataset> {
		// Parse CSV
		const { data, columns } = this.parseCSV(csvContent);

		// Validate structure
		this.validateSalesData(data, columns);

		// Create dataset record
		const dataset = await prisma.dataset.create({
			data: {
				organizationId,
				createdById: userId,
				name,
				fileName,
				fileSize,
				rowCount: data.length,
				columns: columns as never,
				status: 'PROCESSING',
			},
		});

		try {
			// Process and save sales data in batches
			const batchSize = 1000;
			for (let i = 0; i < data.length; i += batchSize) {
				const batch = data.slice(i, i + batchSize);
				const salesData = batch.map((row) => ({
					datasetId: dataset.id,
					...this.mapToSalesData(row, columns),
				}));

				await prisma.salesData.createMany({
					data: salesData as never,
				});
			}

			// Update dataset status to READY
			await prisma.dataset.update({
				where: { id: dataset.id },
				data: { status: 'READY' },
			});

			return {
				...dataset,
				columns: columns as never,
				status: 'READY',
			} as Dataset;
		} catch (error) {
			// Mark dataset as FAILED
			await prisma.dataset.update({
				where: { id: dataset.id },
				data: {
					status: 'FAILED',
					errorMessage:
						error instanceof Error ? error.message : 'Processing failed',
				},
			});

			throw error;
		}
	}

	/**
	 * Get dataset by ID
	 */
	async getDataset(
		datasetId: string,
		organizationId: string,
		options?: {
			includeSalesData?: boolean;
			limit?: number;
		}
	): Promise<Dataset | null> {
		const { includeSalesData = true, limit = 1000 } = options || {};

		const dataset = await prisma.dataset.findFirst({
			where: {
				id: datasetId,
				organizationId,
			},
			...(includeSalesData && {
				include: {
					salesData: {
						take: limit,
						orderBy: { date: 'desc' },
					},
				},
			}),
		});

		return dataset as Dataset | null;
	}

	/**
	 * List datasets for an organization
	 */
	async listDatasets(
		organizationId: string,
		page: number = 1,
		limit: number = 20
	): Promise<{ datasets: Dataset[]; total: number }> {
		const skip = (page - 1) * limit;

		const [datasets, total] = await Promise.all([
			prisma.dataset.findMany({
				where: { organizationId },
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			prisma.dataset.count({ where: { organizationId } }),
		]);

		return {
			datasets: datasets as Dataset[],
			total,
		};
	}

	/**
	 * Delete dataset
	 */
	async deleteDataset(
		datasetId: string,
		organizationId: string
	): Promise<void> {
		// Verify ownership
		const dataset = await this.getDataset(datasetId, organizationId);
		if (!dataset) {
			throw new Error('Dataset not found');
		}

		// Delete dataset and cascade to sales data
		await prisma.dataset.delete({
			where: { id: datasetId },
		});
	}
}