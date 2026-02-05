import type { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'blue';
    className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
    const variants = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100', // Pagado, Confirmado
        warning: 'bg-amber-50 text-amber-700 border-amber-100', // Abono, Pendiente
        error: 'bg-red-50 text-red-700 border-red-100', // Cancelado, Mora
        info: 'bg-sky-50 text-sky-700 border-sky-100', // Proforma
        blue: 'bg-[#5dc0bb]/10 text-[#5dc0bb] border-[#5dc0bb]/20', // DentalFlow, Sincronizado
        neutral: 'bg-slate-50 text-slate-600 border-slate-100', // Default
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
