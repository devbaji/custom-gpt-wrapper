'use client';

import { cn } from '../../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
    children,
    className,
    loading = false,
    variant = 'primary',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none';
    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
        danger: 'bg-red-100 hover:bg-red-200 text-red-800',
    };

    return (
        <button
            className={cn(
                baseStyles,
                variantStyles[variant],
                className,

            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4 absolute" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            <div className={cn(loading && 'text-transparent')}>
                {children}</div>
        </button>
    );
}