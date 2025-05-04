import { cn } from '../../lib/cn';

interface ChatInputProps {
    input: string;
    isLoading: boolean;
    onInputChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onStop: () => void;
}

export default function ChatInput({
    input,
    isLoading,
    onInputChange,
    onKeyDown,
    onSubmit,
    onStop,
}: ChatInputProps) {
    return (
        <div className="border-t border-gray-200 p-4 w-full bg-white">
            <form onSubmit={onSubmit} className={cn('max-w-3xl mx-auto w-full')}>
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Type your message..."
                        className={cn('w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-800')}
                        rows={1}
                        style={{ minHeight: '60px', maxHeight: '200px' }}
                        disabled={isLoading}
                    />
                    {isLoading ? (
                        <button
                            type="button"
                            onClick={onStop}
                            className="absolute right-4 bottom-4 px-4 py-2 rounded-lg transition-colors text-white bg-red-500 hover:bg-red-600"
                        >
                            Stop
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={cn(
                                'absolute right-4 bottom-4 px-4 py-2 rounded-lg transition-colors text-white',
                                isLoading || !input.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            )}
                        >
                            Send
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
} 