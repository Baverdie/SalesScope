'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface ProductFilterProps {
	products: string[];
	selected: string | undefined;
	onChange: (product: string | undefined) => void;
}

export function ProductFilter({
	products,
	selected,
	onChange,
}: ProductFilterProps) {
	return (
		<div className="flex items-center space-x-2">
			<span className="text-sm font-medium text-gray-700">Product:</span>
			<Select
				value={selected || 'all'}
				onValueChange={(value) => onChange(value === 'all' ? undefined : value)}
			>
				<SelectTrigger className="w-48">
					<SelectValue placeholder="All Products" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Products</SelectItem>
					{products.map((product) => (
						<SelectItem key={product} value={product}>
							{product}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}