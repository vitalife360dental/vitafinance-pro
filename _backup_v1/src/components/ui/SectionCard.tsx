import type { ReactNode } from 'react';

interface SectionCardProps {
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function SectionCard({ title, icon, children, action, className = '' }: SectionCardProps) {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-slate-400">{icon}</span>}
                        {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
