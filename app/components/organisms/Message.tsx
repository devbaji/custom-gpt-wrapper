import { MarkdownRenderer } from '../atoms';
import { cn } from '../../lib/cn';

interface MessageProps {
    message: {
        role: 'user' | 'assistant';
        content: string;
        id: string;
    };
    onEdit: (message: { role: 'user' | 'assistant'; content: string; id: string }) => void;
    onSaveEdit: () => void;
    onRetry: (messageId: string) => void;
    editingMessageId: string | null;
    editingContent: string;
    setEditingContent: (content: string) => void;
}

export default function Message({
    message,
    onEdit,
    onSaveEdit,
    onRetry,
    editingMessageId,
    editingContent,
    setEditingContent,
}: MessageProps) {
    return (
        <div className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'w-auto rounded-lg p-2 relative group',
                    message.role === 'user'
                        ? 'bg-blue-500 text-white max-w-[70%]'
                        : 'bg-white text-gray-800 shadow'
                )}
            >
                {editingMessageId === message.id ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => onEdit(message)}
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSaveEdit}
                                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <MarkdownRenderer content={message.content} />
                        {message.role === 'user' && (
                            <button
                                onClick={() => onEdit(message)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                        {message.role === 'assistant' && (
                            <button
                                onClick={() => onRetry(message.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 