import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
        label?: string;
    };
    color?: 'blue' | 'green' | 'amber' | 'rose' | 'slate' | 'indigo' | 'violet';
    variant?: 'default' | 'primary';
}

export function KpiCard({ title, value, icon: Icon, trend, color = 'blue', variant = 'default' }: KpiCardProps) {
    const isPrimary = variant === 'primary';

    // Primary Variant (Gradient Blue/Purple) - Matches Reference "Total Revenue"
    if (isPrimary) {
        return (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-2xl shadow-xl shadow-blue-200 text-white relative overflow-hidden">
                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Icon size={24} className="text-white" />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-white/20 backdrop-blur-md text-white">
                            <span>{trend.value}</span>
                        </div>
                    )}
                </div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-bold tracking-tight mb-1">{value}</h3>
                    <p className="text-blue-100 text-sm font-medium">{title}</p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-xl -ml-10 -mb-5"></div>
            </div>
        );
    }

    // Default Variant (Clean White)
    const colorStyles = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    };

    const currentStyle = colorStyles[color] || colorStyles.blue;

    return (
        <div className="bg-white p-5 rounded-2xl border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${currentStyle.bg} ${currentStyle.text}`}>
                    <Icon size={24} strokeWidth={2} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full 
                        ${trend.direction === 'up' ? 'bg-emerald-50 text-emerald-600' :
                            trend.direction === 'down' ? 'bg-rose-50 text-rose-600' :
                                'bg-slate-50 text-slate-600'}`}>
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">{title}</p>
            </div>
        </div>
    );
}
