'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../lib/cn';
import Image from 'next/image';

interface ChatInputProps {
    input: string;
    isLoading: boolean;
    onInputChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onStop: () => void;
    onFilesSelected: (files: File[]) => void;
    attachedFiles: File[];
}

export default function ChatInput({
    input,
    isLoading,
    onInputChange,
    onKeyDown,
    onSubmit,
    onStop,
    onFilesSelected,
    attachedFiles,
}: ChatInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const focusTextarea = () => {
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);
    };

    const isImageFile = (file: File) => {
        return file.type.startsWith('image/');
    };

    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles: File[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            e.preventDefault(); // Prevent default paste only when we have images
            const newFiles = [...attachedFiles, ...imageFiles];
            onFilesSelected(newFiles.slice(0, 5)); // Limit to 5 files
        }
    }, [attachedFiles, onFilesSelected]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener('paste', handlePaste);
            return () => textarea.removeEventListener('paste', handlePaste);
        }
    }, [handlePaste]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const imageFiles = acceptedFiles.filter(isImageFile);
        if (imageFiles.length > 0) {
            const newFiles = [...attachedFiles, ...imageFiles];
            onFilesSelected(newFiles.slice(0, 5)); // Limit to 5 files
            focusTextarea();
        }
    }, [attachedFiles, onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
        },
        maxFiles: 5,
        disabled: isLoading,
    });

    const removeFile = (index: number) => {
        const newFiles = [...attachedFiles];
        newFiles.splice(index, 1);
        onFilesSelected(newFiles);
        focusTextarea();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const imageFiles = Array.from(e.target.files).filter(isImageFile);
            if (imageFiles.length > 0) {
                const newFiles = [...attachedFiles, ...imageFiles];
                onFilesSelected(newFiles.slice(0, 5)); // Limit to 5 files
                focusTextarea();
            }
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <form onSubmit={onSubmit} className={cn('w-full')}>
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
                        isDragActive && 'border-blue-500 bg-blue-50'
                    )}
                >
                    <input
                        {...getInputProps()}
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        onClick={(e) => e.stopPropagation()}
                        accept="image/*"
                    />
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={isDragActive ? 'Drop images here...' : 'Type your message...'}
                        className={cn('w-full p-4 pr-24 rounded-lg focus:outline-none resize-none bg-transparent text-gray-800')}
                        rows={1}
                        style={{ minHeight: '24px', maxHeight: '200px', height: 'auto' }}
                        disabled={isLoading}
                    />
                    <div className="absolute right-4 bottom-4 flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={handleAttachClick}
                            className={cn(
                                "p-2 text-gray-500 hover:text-gray-700 cursor-pointer",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                            title="Attach images"
                            disabled={isLoading}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        {isLoading ? (
                            <button
                                type="button"
                                onClick={onStop}
                                className="px-4 py-2 rounded-lg transition-colors text-white bg-red-500 hover:bg-red-600"
                            >
                                Stop
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                                className={cn(
                                    'px-4 py-2 rounded-lg transition-colors text-white',
                                    isLoading || (!input.trim() && attachedFiles.length === 0)
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                )}
                            >
                                Send
                            </button>
                        )}
                    </div>
                </div>
                {attachedFiles.length > 0 && (
                    <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                            {attachedFiles.map((file, index) => (
                                <div
                                    key={`${file.name}-${index}`}
                                    className="flex items-center bg-gray-100 rounded-lg px-3 py-1 text-sm"
                                >
                                    <div className="relative w-8 h-8">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="object-contain rounded"
                                            fill
                                            sizes="32px"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="ml-2 text-gray-500 hover:text-red-500"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
} 