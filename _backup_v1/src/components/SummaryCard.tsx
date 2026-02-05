import { Sparkles } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    amount: number;
    subtitle: string;
    variant: 'efectivo' | 'transferencias' | 'payphone';
}

export default function SummaryCard({ title, amount, subtitle, variant }: SummaryCardProps) {
    const variantStyles = {
        efectivo: 'summary-card-efectivo',
        transferencias: 'summary-card-transferencias',
        payphone: 'summary-card-payphone',
    };

    return (
        <div className={`summary-card ${variantStyles[variant]}`}>
            <span className="summary-title">{title}</span>
            <span className="summary-amount">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <div className="summary-subtitle">
                {variant === 'efectivo' && <Sparkles size={14} />}
                <span>{subtitle}</span>
            </div>
        </div>
    );
}
