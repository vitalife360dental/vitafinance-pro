import type { ReactNode } from 'react';

interface PageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    actions?: ReactNode;
}

export function PageLayout({ title, subtitle, children, actions }: PageLayoutProps) {
    return (
        <div className="flex flex-col h-full bg-slate-50 min-h-screen">
            {/* Header Section */}
            <header className="px-8 py-6 bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
                        )}
                    </div>
                    {actions && <div className="flex gap-3">{actions}</div>}
                </div>
            </header>

            {/* Main Content Scroll Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
