'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('/api/auth', {
                method: 'DELETE',
            });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Button
            onClick={handleLogout}
            loading={isLoggingOut}
            variant="danger"
        >
            Logout
        </Button>
    );
} 