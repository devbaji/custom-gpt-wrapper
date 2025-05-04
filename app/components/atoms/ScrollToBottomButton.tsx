interface ScrollToBottomButtonProps {
    onClick: () => void;
}

export default function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </button>
    );
} 