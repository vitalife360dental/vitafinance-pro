import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
    };
    color?: 'blue' | 'green' | 'amber' | 'rose' | 'slate' | 'indigo' | 'violet';
    variant?: 'default' | 'primary';
}

export function StatCard({ title, value, icon: Icon, trend, color = 'blue', variant = 'default' }: StatCardProps) {
    const isPrimary = variant === 'primary';

    // Primary Variant (Gradient Blue/Purple)
    if (isPrimary) {
        return (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Icon size={24} className="text-white" />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                            <span>{trend.value}</span>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-3xl font-bold tracking-tight mb-1">{value}</h3>
                    <p className="text-blue-100 text-sm font-medium">{title}</p>
                </div>
            </div>
        );
    }

    // Default Variant (White "Swiss" Card)
    const colorStyles = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-600' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    };

    const style = colorStyles[color] || colorStyles.blue;

    return (
        <Card className="flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300 border-none shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${style.bg} ${style.text}`}>
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
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">{title}</p>
            </div>
        </Card>
    );
}
