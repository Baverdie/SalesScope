'use client';

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

interface TrendDataPoint {
	date: string;
	revenue: number;
	sales: number;
}

interface TrendChartProps {
	data: TrendDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});
	};

	const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
	const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
	const avgDailyRevenue = totalRevenue / data.length;

	return (
		<div>
			{/* Summary Stats */}
			<div className="grid grid-cols-3 gap-4 mb-6">
				<div>
					<p className="text-sm text-gray-600">Total Revenue (30d)</p>
					<p className="text-xl font-bold text-gray-900">
						{formatCurrency(totalRevenue)}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600">Total Sales (30d)</p>
					<p className="text-xl font-bold text-gray-900">
						{totalSales.toLocaleString()}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600">Avg Daily Revenue</p>
					<p className="text-xl font-bold text-gray-900">
						{formatCurrency(avgDailyRevenue)}
					</p>
				</div>
			</div>

			{/* Chart */}
			<ResponsiveContainer width="100%" height={250}>
				<LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
					<XAxis
						dataKey="date"
						tickFormatter={formatDate}
						stroke="#9ca3af"
						tick={{ fontSize: 12 }}
						tickMargin={10}
					/>
					<YAxis
						yAxisId="revenue"
						orientation="left"
						tickFormatter={formatCurrency}
						stroke="#10b981"
						tick={{ fontSize: 12 }}
						width={80}
					/>
					<YAxis
						yAxisId="sales"
						orientation="right"
						stroke="#3b82f6"
						tick={{ fontSize: 12 }}
						width={60}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: 'white',
							border: '1px solid #e5e7eb',
							borderRadius: '8px',
							padding: '12px',
						}}
						formatter={(value: number, name: string) => {
							if (name === 'revenue') {
								return [formatCurrency(value), 'Revenue'];
							}
							return [value.toLocaleString(), 'Sales'];
						}}
						labelFormatter={(label) => formatDate(label)}
					/>
					<Line
						yAxisId="revenue"
						type="monotone"
						dataKey="revenue"
						stroke="#10b981"
						strokeWidth={2}
						dot={false}
						name="revenue"
					/>
					<Line
						yAxisId="sales"
						type="monotone"
						dataKey="sales"
						stroke="#3b82f6"
						strokeWidth={2}
						dot={false}
						name="sales"
					/>
				</LineChart>
			</ResponsiveContainer>

			{/* Legend */}
			<div className="flex items-center justify-center gap-6 mt-4">
				<div className="flex items-center gap-2">
					<div className="w-4 h-1 bg-green-500"></div>
					<span className="text-sm text-gray-600">Revenue (left axis)</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-4 h-1 bg-blue-500"></div>
					<span className="text-sm text-gray-600">Sales (right axis)</span>
				</div>
			</div>
		</div>
	);
}