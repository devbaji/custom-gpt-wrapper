'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    accept?: Record<string, string[]>;
    maxSize?: number;
    maxFiles?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    accept,
    maxSize = 10485760, // 10MB default
    maxFiles = 1,
}) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFileSelect(acceptedFiles);
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles,
    });

    return (
        <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
      `}
        >
            <input {...getInputProps()} />
            <div className="space-y-2">
                <div className="text-gray-600">
                    <svg
                        className="mx-auto h-12 w-12"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M24 8l12 12m0 0l-12 12m12-12H12"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            transform="rotate(90 24 24)"
                        />
                    </svg>
                </div>
                <div className="text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">
                    {maxFiles === 1 ? 'Upload a file' : `Upload up to ${maxFiles} files`}
                </p>
            </div>
        </div>
    );
}; 