import type { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
    return (
        <div className={`p-8 max-w-[1600px] mx-auto ${className}`}>
            {children}
        </div>
    );
}
