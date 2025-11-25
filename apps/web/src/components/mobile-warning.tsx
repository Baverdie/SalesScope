'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, X } from 'lucide-react';

export function MobileWarning() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Check if user is on mobile
		const isMobile = window.innerWidth < 768;

		// Check if user has already dismissed the warning
		const hasSeenWarning = sessionStorage.getItem('mobile-warning-seen');

		if (isMobile && !hasSeenWarning) {
			setIsOpen(true);
		}
	}, []);

	const handleDismiss = () => {
		sessionStorage.setItem('mobile-warning-seen', 'true');
		setIsOpen(false);
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/50 z-50" onClick={handleDismiss} />

			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
					{/* Close button */}
					<button
						onClick={handleDismiss}
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
					>
						<X className="w-5 h-5" />
					</button>

					{/* Icon */}
					<div className="flex justify-center mb-4">
						<div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
							<Monitor className="w-8 h-8 text-indigo-600" />
						</div>
					</div>

					{/* Content */}
					<h3 className="text-xl font-bold text-gray-900 text-center mb-2">
						Meilleure expérience sur ordinateur
					</h3>
					<p className="text-gray-600 text-center mb-6">
						Cette application n'est volontairement pas optimisée pour les téléphones.
						Pour une expérience optimale, veuillez utiliser un ordinateur de bureau.
					</p>

					{/* Button */}
					<Button
						onClick={handleDismiss}
						className="w-full"
						size="lg"
					>
						J'ai compris
					</Button>
				</div>
			</div>
		</>
	);
}