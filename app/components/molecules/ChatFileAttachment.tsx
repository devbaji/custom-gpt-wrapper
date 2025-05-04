'use client';

import React from 'react';
import { FileUploadZone } from './FileUploadZone';

interface ChatFileAttachmentProps {
    onFilesSelected: (files: File[]) => void;
}

export const ChatFileAttachment: React.FC<ChatFileAttachmentProps> = ({
    onFilesSelected,
}) => {
    const acceptedFileTypes = {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
        'text/*': ['.txt', '.md', '.json'],
        'application/pdf': ['.pdf'],
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <FileUploadZone
                onFilesSelected={onFilesSelected}
                maxFiles={5}
                accept={acceptedFileTypes}
            />
        </div>
    );
}; 