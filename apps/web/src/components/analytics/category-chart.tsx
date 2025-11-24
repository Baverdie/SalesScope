'use client';

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';

interface CategoryChartProps {
	data: Array<{
		category: string;
		revenue: number;
		count: number;
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

export function CategoryChart({ data }: CategoryChartProps) {
	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="category" tick={{ fontSize: 12 }} />
					<YAxis
						tickFormatter={formatCompactCurrency}
						tick={{ fontSize: 12 }}
					/>
					<Tooltip
						formatter={(value: number) => formatCurrency(value)}
						labelStyle={{ color: '#000' }}
					/>
					<Legend />
					<Bar dataKey="revenue" fill="#4f46e5" name="Revenue" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}