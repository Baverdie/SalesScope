'use client';

import { Button } from '@/components/ui/button';

interface DateFilterProps {
	selected: string;
	onChange: (filter: string) => void;
}

export function DateFilter({ selected, onChange }: DateFilterProps) {
	const filters = [
		{ value: 'all', label: 'All Time' },
		{ value: '12m', label: 'Last 12 Months' },
		{ value: '6m', label: 'Last 6 Months' },
		{ value: '3m', label: 'Last 3 Months' },
		{ value: '1m', label: 'Last Month' },
	];

	return (
		<div className="flex items-center space-x-2">
			<span className="text-sm font-medium text-gray-700">Time Period:</span>
			<div className="flex space-x-2">
				{filters.map((filter) => (
					<Button
						key={filter.value}
						variant={selected === filter.value ? 'default' : 'outline'}
						size="sm"
						onClick={() => onChange(filter.value)}
					>
						{filter.label}
					</Button>
				))}
			</div>
		</div>
	);
}