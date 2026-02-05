import { FileText } from 'lucide-react';
import type { Transaction } from '../data/mockData';

interface TransactionItemProps {
    transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
    const getAvatarIcon = (name: string) => {
        // Simple avatar generation based on name
        const firstLetter = name && name !== '-' ? name.charAt(0).toUpperCase() : '?';
        const colors = ['#E0F2FE', '#F0FDF4', '#FEF3C7', '#FEE2E2', '#F3E8FF'];
        const color = colors[name.length % colors.length];

        return (
            <div
                className="transaction-avatar"
                style={{ backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' }}
            >
                {firstLetter}
            </div>
        );
    };

    return (
        <div className="transaction-item">
            {/* Avatar */}
            {getAvatarIcon(transaction.patientName)}

            {/* Details */}
            <div className="transaction-details">
                <div className="transaction-header">
                    <span className="transaction-name">{transaction.patientName}</span>
                    <span className="transaction-code">{transaction.paymentCode}</span>
                </div>
                <span className="transaction-treatment">
                    {transaction.treatment} • {transaction.time}
                </span>
            </div>

            {/* Amount */}
            <div className="transaction-amount-section">
                <span className="transaction-amount-label">MONTO</span>
                <span className="transaction-amount">+${transaction.amount.toFixed(2)}</span>
            </div>

            {/* Status */}
            <div className="transaction-status-section">
                <span className="transaction-status-label">ESTADO</span>
                <span className={`transaction-status ${transaction.status.toUpperCase() === 'PAGADO' ? 'status-pagado' : 'status-abono'}`}>
                    {transaction.status.toUpperCase()}
                </span>
            </div>

            {/* Action */}
            <button className="transaction-action">
                <FileText size={18} />
            </button>
        </div>
    );
}
