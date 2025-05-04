import { MarkdownRenderer } from '../atoms';
import { cn } from '../../lib/cn';
import { useRef, useEffect } from 'react';
import Image from 'next/image';

interface MessageProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
        id: string;
        attachments?: {
            type: string;
            url: string;
            name: string;
        }[];
        formDataEntries?: [string, string | Blob][];
    };
    onEdit: (message: { role: 'user' | 'assistant'; content: string; id: string }) => void;
    onSaveEdit: () => void;
    onRetry: (messageId: string) => void;
    editingMessageId: string | null;
    editingContent: string;
    setEditingContent: (content: string) => void;
    isLast?: boolean;
    isLoading?: boolean;
}

export default function Message({
    message,
    onEdit,
    onSaveEdit,
    onRetry,
    editingMessageId,
    editingContent,
    setEditingContent,
    isLast,
    isLoading,
}: MessageProps) {
    const imageAttachments = message.attachments?.filter(attachment =>
        attachment.type.startsWith('image/')
    ) || [];

    // Allow editing for user messages, including those with images
    const canEdit = message.role === 'user';
    const editButtonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside of popover
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (editingMessageId === message.id &&
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                editButtonRef.current &&
                !editButtonRef.current.contains(event.target as Node)) {
                onEdit(message); // Cancel edit
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingMessageId, message, onEdit]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const trimmedContent = editingContent.trim();
            if (trimmedContent) {
                onSaveEdit();
            }
        }
    };

    return (
        <div className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start', isLast ? 'mb-12' : 'mb-4')}>
            <div
                className={cn(
                    'w-auto rounded-lg p-3 relative group',
                    message.role === 'user'
                        ? 'bg-blue-500 text-white max-w-[70%]'
                        : 'bg-white text-gray-800 shadow'
                )}
            >
                <div>
                    {message.content && <MarkdownRenderer content={message.content} />}
                    {imageAttachments.length > 0 && (
                        <div className={cn(
                            "mt-2 grid gap-1",
                            imageAttachments.length === 1 ? "grid-cols-1 max-w-[120px]" :
                                "grid-cols-2 max-w-[240px]"
                        )}>
                            {imageAttachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "relative aspect-square rounded-lg overflow-hidden",
                                        imageAttachments.length === 3 && index === 2 ? "col-span-2" : ""
                                    )}
                                >
                                    <Image
                                        src={attachment.url}
                                        alt={attachment.name}
                                        className="object-cover rounded-lg"
                                        fill
                                        sizes="(max-width: 120px) 100vw, 120px"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {canEdit && !isLoading && (
                        <button
                            ref={editButtonRef}
                            onClick={() => onEdit(message)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    )}
                    {message.role === 'assistant' && !isLoading && (
                        <button
                            onClick={() => onRetry(message.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Edit Popover */}
                {editingMessageId === message.id && (
                    <div
                        ref={popoverRef}
                        className="absolute right-0 top-8 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50"
                        style={{
                            transformOrigin: 'top right',
                            animation: 'popoverFadeIn 0.2s ease-out'
                        }}
                    >
                        <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45" />
                        <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm mb-3"
                            rows={4}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => onEdit(message)}
                                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSaveEdit}
                                disabled={!editingContent.trim()}
                                className={cn(
                                    "px-3 py-1.5 text-xs rounded",
                                    editingContent.trim()
                                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                )}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 