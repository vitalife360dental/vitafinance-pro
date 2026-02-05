import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-14">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-slate-500 font-medium mt-2">{subtitle}</p>
                )}
            </div>

            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
