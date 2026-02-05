import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: string;
}

export function Card({ children, className = '', padding = 'p-6' }: CardProps) {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
            <div className={padding}>
                {children}
            </div>
        </div>
    );
}
