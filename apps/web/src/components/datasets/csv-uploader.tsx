'use client';

import { useState, useCallback } from 'react';
import { useUploadDataset } from '@/hooks/use-datasets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CSVUploader({ onSuccess }: { onSuccess?: () => void }) {
	const [file, setFile] = useState<File | null>(null);
	const [datasetName, setDatasetName] = useState('');
	const [isDragging, setIsDragging] = useState(false);

	const uploadDataset = useUploadDataset();

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile && droppedFile.name.endsWith('.csv')) {
			setFile(droppedFile);
			if (!datasetName) {
				setDatasetName(droppedFile.name.replace('.csv', ''));
			}
		} else {
			alert('Please upload a CSV file');
		}
	}, [datasetName]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			if (!datasetName) {
				setDatasetName(selectedFile.name.replace('.csv', ''));
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) return;

		const name = datasetName || file.name.replace('.csv', '');

		uploadDataset.mutate(
			{ name, file },
			{
				onSuccess: () => {
					setFile(null);
					setDatasetName('');
					onSuccess?.();
				},
			}
		);
	};

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label htmlFor="datasetName">Dataset Name</Label>
					<Input
						id="datasetName"
						type="text"
						value={datasetName}
						onChange={(e) => setDatasetName(e.target.value)}
						placeholder="My Sales Data"
						className="mt-1"
					/>
				</div>

				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
							? 'border-indigo-500 bg-indigo-50'
							: 'border-gray-300 hover:border-gray-400'
						}`}
				>
					{file ? (
						<div className="space-y-2">
							<svg
								className="mx-auto h-12 w-12 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p className="text-sm font-medium text-gray-900">
								{file.name}
							</p>
							<p className="text-xs text-gray-500">
								{(file.size / 1024).toFixed(2)} KB
							</p>
							<button
								type="button"
								onClick={() => setFile(null)}
								className="text-sm text-indigo-600 hover:text-indigo-500"
							>
								Remove
							</button>
						</div>
					) : (
						<div className="space-y-2">
							<svg
								className="mx-auto h-12 w-12 text-gray-400"
								stroke="currentColor"
								fill="none"
								viewBox="0 0 48 48"
							>
								<path
									d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<div className="text-sm text-gray-600">
								<label
									htmlFor="file-upload"
									className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
								>
									<span>Upload a file</span>
									<input
										id="file-upload"
										name="file-upload"
										type="file"
										accept=".csv"
										className="sr-only"
										onChange={handleFileChange}
									/>
								</label>
								<span className="pl-1">or drag and drop</span>
							</div>
							<p className="text-xs text-gray-500">CSV files only</p>
						</div>
					)}
				</div>

				{uploadDataset.isError && (
					<div className="rounded-md bg-red-50 p-4">
						<p className="text-sm text-red-800">
							{uploadDataset.error instanceof Error
								? uploadDataset.error.message
								: 'Upload failed. Please try again.'}
						</p>
					</div>
				)}

				<Button
					type="submit"
					className="w-full"
					disabled={!file || uploadDataset.isPending}
				>
					{uploadDataset.isPending ? 'Uploading...' : 'Upload Dataset'}
				</Button>
			</form>
		</div>
	);
}