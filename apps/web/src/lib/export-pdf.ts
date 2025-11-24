import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPDFOptions {
	datasetName: string;
	fileName: string;
	filters?: {
		dateFilter?: string;
		category?: string;
		product?: string;
	};
}

export async function exportAnalyticsToPDF(options: ExportPDFOptions) {
	const { datasetName, fileName, filters } = options;

	// Create PDF
	const pdf = new jsPDF('p', 'mm', 'a4');
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	let currentY = 20;

	// Add title
	pdf.setFontSize(24);
	pdf.setFont('helvetica', 'bold');
	pdf.text('Sales Analytics Report', pageWidth / 2, currentY, {
		align: 'center',
	});
	currentY += 10;

	// Add dataset name
	pdf.setFontSize(14);
	pdf.setFont('helvetica', 'normal');
	pdf.text(datasetName, pageWidth / 2, currentY, { align: 'center' });
	currentY += 10;

	// Add date
	const today = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	pdf.setFontSize(10);
	pdf.setTextColor(100);
	pdf.text(`Generated on ${today}`, pageWidth / 2, currentY, {
		align: 'center',
	});
	currentY += 15;

	// Add active filters if any
	if (filters) {
		const activeFilters = [];
		if (filters.dateFilter && filters.dateFilter !== 'all') {
			const dateLabels: { [key: string]: string } = {
				'12m': 'Last 12 Months',
				'6m': 'Last 6 Months',
				'3m': 'Last 3 Months',
				'1m': 'Last Month',
			};
			activeFilters.push(`Period: ${dateLabels[filters.dateFilter]}`);
		}
		if (filters.category) {
			activeFilters.push(`Category: ${filters.category}`);
		}
		if (filters.product) {
			activeFilters.push(`Product: ${filters.product}`);
		}

		if (activeFilters.length > 0) {
			pdf.setFontSize(9);
			pdf.setTextColor(60);
			pdf.text('Active Filters:', 15, currentY);
			currentY += 5;
			activeFilters.forEach((filter) => {
				pdf.text(`  • ${filter}`, 20, currentY);
				currentY += 5;
			});
			currentY += 5;
		}
	}

	pdf.setTextColor(0);

	// Capture KPIs
	const kpisElement = document.getElementById('kpis-section');
	if (kpisElement) {
		const canvas = await html2canvas(kpisElement, {
			scale: 2,
			backgroundColor: '#ffffff',
		});
		const imgData = canvas.toDataURL('image/png');
		const imgWidth = pageWidth - 30;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		if (currentY + imgHeight > pageHeight - 20) {
			pdf.addPage();
			currentY = 20;
		}

		pdf.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
		currentY += imgHeight + 10;
	}

	// Capture Revenue Chart
	const revenueChartElement = document.getElementById('revenue-chart');
	if (revenueChartElement) {
		if (currentY + 100 > pageHeight - 20) {
			pdf.addPage();
			currentY = 20;
		}

		const canvas = await html2canvas(revenueChartElement, {
			scale: 2,
			backgroundColor: '#ffffff',
		});
		const imgData = canvas.toDataURL('image/png');
		const imgWidth = pageWidth - 30;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		pdf.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
		currentY += imgHeight + 10;
	}

	// Capture Category Chart
	const categoryChartElement = document.getElementById('category-chart');
	if (categoryChartElement) {
		if (currentY + 80 > pageHeight - 20) {
			pdf.addPage();
			currentY = 20;
		}

		const canvas = await html2canvas(categoryChartElement, {
			scale: 2,
			backgroundColor: '#ffffff',
		});
		const imgData = canvas.toDataURL('image/png');
		const imgWidth = (pageWidth - 35) / 2;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		pdf.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
	}

	// Capture Product Chart
	const productChartElement = document.getElementById('product-chart');
	if (productChartElement) {
		const canvas = await html2canvas(productChartElement, {
			scale: 2,
			backgroundColor: '#ffffff',
		});
		const imgData = canvas.toDataURL('image/png');
		const imgWidth = (pageWidth - 35) / 2;
		const imgHeight = (canvas.height * imgWidth) / canvas.width;

		pdf.addImage(
			imgData,
			'PNG',
			pageWidth / 2 + 2.5,
			currentY,
			imgWidth,
			imgHeight
		);
	}

	// Save PDF
	pdf.save(fileName);
}