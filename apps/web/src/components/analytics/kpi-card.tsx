'use client';

interface KPICardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ReactNode;
	formatValue?: boolean;
}

export function KPICard({ title, value, subtitle, icon, formatValue = false }: KPICardProps) {
	const displayValue = typeof value === 'string' ? value : formatValue ? value.toLocaleString() : value;

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<p className="text-3xl font-bold text-gray-900 mt-2">{displayValue}</p>
					{subtitle && (
						<p className="text-sm text-gray-500 mt-1">{subtitle}</p>
					)}
				</div>
				{icon && <div className="text-indigo-600">{icon}</div>}
			</div>
		</div>
	);
}