import React from 'react';

interface LoaderProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Loader: React.FC<LoaderProps> = ({ message, size = 'md' }) => {
    const sizes = {
        sm: 'h-6 w-6 border-2',
        md: 'h-12 w-12 border-3',
        lg: 'h-16 w-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className={`${sizes[size]} rounded-full border-primary/30 border-t-primary spinner`}
            />
            {message && (
                <p className="text-gray-500 text-sm font-medium animate-pulse">{message}</p>
            )}
        </div>
    );
};

export default Loader;
