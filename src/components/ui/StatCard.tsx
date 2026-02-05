import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string;
    trend?: number; // e.g., +12 or -5
    trendLabel?: string; // e.g., "vs last month"
    icon?: React.ReactNode;
    color?: 'blue' | 'emerald' | 'violet' | 'orange';
}

export function StatCard({ label, value, trend, trendLabel, icon, color = 'blue' }: StatCardProps) {
    const isPositive = trend && trend >= 0;

    const colorStyles = {
        blue: 'bg-[#5dc0bb]/10 text-[#5dc0bb]',
        emerald: 'bg-emerald-50 text-emerald-600',
        violet: 'bg-violet-50 text-violet-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                </div>
                {icon && (
                    <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                        {icon}
                    </div>
                )}
            </div>

            {trend !== undefined && (
                <div className="flex items-center gap-2">
                    <span className={`
            inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full
            ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
          `}>
                        {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                    {trendLabel && <span className="text-xs text-slate-400">{trendLabel}</span>}
                </div>
            )}
        </Card>
    );
}
