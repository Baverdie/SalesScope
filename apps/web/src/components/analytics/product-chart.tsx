'use client';

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

interface ProductChartProps {
	data: Array<{
		product: string;
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

export function ProductChart({ data }: ProductChartProps) {
	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold mb-4">Top 10 Products by Revenue</h3>
			<ResponsiveContainer width="100%" height={400}>
				<BarChart data={data} layout="vertical">
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						type="number"
						tickFormatter={formatCompactCurrency}
						tick={{ fontSize: 12 }}
					/>
					<YAxis
						dataKey="product"
						type="category"
						width={150}
						tick={{ fontSize: 11 }}
					/>
					<Tooltip
						formatter={(value: number) => formatCurrency(value)}
						labelStyle={{ color: '#000' }}
					/>
					<Bar dataKey="revenue" fill="#10b981" name="Revenue" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}