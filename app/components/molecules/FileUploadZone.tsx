'use client';

import React, { useState } from 'react';
import { FileUpload } from '../atoms/FileUpload';
import Image from 'next/image';

interface FileUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    accept?: Record<string, string[]>;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    onFilesSelected,
    maxFiles = 1,
    accept,
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleFileSelect = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        onFilesSelected(selectedFiles);

        // Create previews for images
        const newPreviews = selectedFiles.map((file) => {
            if (file.type.startsWith('image/')) {
                return URL.createObjectURL(file);
            }
            return '';
        });
        setPreviews(newPreviews);
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
        onFilesSelected(newFiles);

        const newPreviews = [...previews];
        if (newPreviews[index]) {
            URL.revokeObjectURL(newPreviews[index]);
        }
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    return (
        <div className="space-y-4">
            <FileUpload
                onFileSelect={handleFileSelect}
                maxFiles={maxFiles}
                accept={accept}
            />

            {files.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    {previews[index] && (
                                        <div className="relative h-10 w-10">
                                            <Image
                                                src={previews[index]}
                                                alt={`Preview of ${file.name}`}
                                                className="object-contain rounded"
                                                fill
                                                sizes="40px"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}; 