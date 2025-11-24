'use client';

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
	data: Array<{
		date: string;
		revenue: number;
		quantity: number;
	}>;
}

const formatCurrency = (value: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

const formatCompactCurrency = (value: number) => {
	if (value >= 1000000) {
		return `$${(value / 1000000).toFixed(1)}M`;
	} else if (value >= 1000) {
		return `$${(value / 1000).toFixed(0)}K`;
	}
	return `$${value.toFixed(0)}`;
};

const formatDate = (dateStr: string) => {
	// Check if it's a day (YYYY-MM-DD)
	if (dateStr.length === 10) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	// Check if it's a month (YYYY-MM)
	if (dateStr.length === 7) {
		const [year, month] = dateStr.split('-');
		const date = new Date(parseInt(year), parseInt(month) - 1);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
	}

	// Fallback
	return dateStr;
};

const getAggregationType = (data: Array<{ date: string }>) => {
	if (data.length === 0) return 'Monthly';

	const firstDate = data[0].date;

	if (firstDate.length === 10) {
		return 'Daily';
	} else if (firstDate.length === 7) {
		return 'Monthly';
	} else {
		return 'Weekly';
	}
};

export function RevenueChart({ data }: RevenueChartProps) {
	const aggregationType = getAggregationType(data);

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold mb-4">
				Revenue Over Time ({aggregationType})
			</h3>
			<ResponsiveContainer width="100%" height={400}>
				<LineChart
					data={data}
					margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="date"
						tickFormatter={formatDate}
						tick={{ fontSize: 11 }}
						angle={-45}
						textAnchor="end"
						height={80}
						interval="preserveStartEnd"
					/>
					<YAxis
						tickFormatter={formatCompactCurrency}
						tick={{ fontSize: 12 }}
						domain={['auto', 'auto']}
						allowDataOverflow={false}
					/>
					<Tooltip
						formatter={(value: number) => formatCurrency(value)}
						labelFormatter={formatDate}
						labelStyle={{ color: '#000', fontWeight: 'bold' }}
						contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
					/>
					<Legend wrapperStyle={{ paddingTop: '20px' }} />
					<Line
						type="monotone"
						dataKey="revenue"
						stroke="#4f46e5"
						strokeWidth={3}
						name="Revenue"
						dot={{ r: 5, fill: '#4f46e5' }}
						activeDot={{ r: 7 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}