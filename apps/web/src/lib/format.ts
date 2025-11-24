export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

export function formatNumber(value: number): string {
	return new Intl.NumberFormat('en-US').format(value);
}

export function formatCompactNumber(value: number): string {
	return new Intl.NumberFormat('en-US', {
		notation: 'compact',
		compactDisplay: 'short',
	}).format(value);
}

// Nouvelle fonction pour calculer les dates
export function getDateRange(filter: string): {
	startDate?: string;
	endDate?: string;
} {
	const now = new Date();
	const endDate = now.toISOString().split('T')[0];

	if (filter === 'all') {
		return {};
	}

	let startDate: Date;

	switch (filter) {
		case '1m':
			startDate = new Date(now);
			startDate.setMonth(now.getMonth() - 1);
			break;
		case '3m':
			startDate = new Date(now);
			startDate.setMonth(now.getMonth() - 3);
			break;
		case '6m':
			startDate = new Date(now);
			startDate.setMonth(now.getMonth() - 6);
			break;
		case '12m':
			startDate = new Date(now);
			startDate.setFullYear(now.getFullYear() - 1);
			break;
		default:
			return {};
	}

	return {
		startDate: startDate.toISOString().split('T')[0],
		endDate,
	};
}