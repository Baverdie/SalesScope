'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface CategoryFilterProps {
	categories: string[];
	selected: string | undefined;
	onChange: (category: string | undefined) => void;
}

export function CategoryFilter({
	categories,
	selected,
	onChange,
}: CategoryFilterProps) {
	return (
		<div className="flex items-center space-x-2">
			<span className="text-sm font-medium text-gray-700">Category:</span>
			<Select
				value={selected || 'all'}
				onValueChange={(value) => onChange(value === 'all' ? undefined : value)}
			>
				<SelectTrigger className="w-48">
					<SelectValue placeholder="All Categories" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Categories</SelectItem>
					{categories.map((category) => (
						<SelectItem key={category} value={category}>
							{category}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}