import { Button } from '../atoms';
import LogoutButton from '../atoms/LogoutButton';

interface HeaderProps {
    displayName: string;
    onNewChat: () => void;
    isClearingChat: boolean;
    hasMessages: boolean;
}

export default function Header({ displayName, onNewChat, isClearingChat, hasMessages }: HeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-xs sm:text-xl font-semibold text-gray-800">{displayName}</h1>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={onNewChat}
                        loading={isClearingChat}
                        variant="secondary"
                        disabled={!hasMessages}
                    >
                        New Chat
                    </Button>
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
} 