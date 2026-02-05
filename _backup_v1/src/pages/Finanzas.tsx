import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { financeService } from '../services/financeService';
import { PageContainer } from '../components/ui/PageContainer';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { FinancialOverview } from '../components/finance/FinancialOverview';

// Types derived from service
interface Transaction {
    id: number | string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    description?: string;
    category?: string;
    patient_name?: string;
    status?: string;
    payment_code?: string;
    treatment_name?: string;
    balance: number;
    daysCounter?: number;
    displayTime?: string;
}

export default function Finanzas() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await financeService.getTransactions();

            // Map service data to UI structure
            const formatted: Transaction[] = data.map((t: any) => ({
                id: t.id,
                date: t.date,
                amount: Number(t.amount),
                type: t.type,
                description: t.concept || t.description,
                category: t.category,
                patient_name: t.patient_name || '-',
                treatment_name: t.treatment_name || t.description,
                payment_code: t.payment_code || '-',
                status: t.status || 'COMPLETADO',
                balance: Number(t.balance || 0),
                daysCounter: 0, // Placeholder
                displayTime: t.displayTime
            }));

            setTransactions(formatted);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    // Calculate totals for Dashboard
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalReceivable = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.balance || 0), 0);
    const totalPatients = new Set(transactions.map(t => t.patient_name).filter(n => n && n !== '-')).size;

    const filteredTransactions = transactions.filter((t) =>
        (t.treatment_name && t.treatment_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.patient_name && t.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const balance = totalIncome - totalExpense;

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando finanzas...</div>;

    const BalanceBadge = (
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance General</span>
            <span className={`text-xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                ${balance.toFixed(2)}
            </span>
        </div>
    );

    // DataTable Columns Definition
    const columns = [
        { header: 'Fecha', accessorKey: 'date', className: 'whitespace-nowrap', cell: (t: Transaction) => <span className="font-medium text-slate-700">{t.date}</span> },
        { header: 'Hora', accessorKey: 'displayTime', className: 'font-mono text-xs text-slate-500' },
        {
            header: 'Código',
            cell: (t: Transaction) => (
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-slate-200">
                    {t.payment_code}
                </span>
            )
        },
        { header: 'Paciente', accessorKey: 'patient_name', className: 'uppercase font-bold text-xs text-slate-800' },
        { header: 'Tratamiento', cell: (t: Transaction) => <div className="max-w-[180px] truncate text-xs text-slate-600" title={t.treatment_name}>{t.treatment_name}</div> },
        { header: 'Doctor', cell: (t: Transaction) => <span className="text-xs text-slate-600">{t.type === 'income' ? 'Dr. Diego Lara' : '-'}</span> },
        { header: 'Estado', cell: (t: Transaction) => <Badge variant={t.status === 'COMPLETADO' || t.status === 'PAGADO' ? 'success' : 'warning'}>{t.status}</Badge> },
        {
            header: 'Monto',
            className: 'text-right',
            cell: (t: Transaction) => (
                <span className={`font-bold ${t.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        { header: 'Saldo', className: 'text-right', cell: (t: Transaction) => <span className="font-bold text-amber-500">${t.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> }
    ];

    console.log('FINANZAS RENDERED - SYSTEMATIC LAYOUT V4');

    return (
        <PageContainer>
            {/* Header */}
            <PageHeader
                title="Finanzas"
                subtitle="Gestión financiera integral de tu clínica."
            >
                {BalanceBadge}
            </PageHeader>

            {/* Bento Grid Financial Overview */}
            <FinancialOverview
                metrics={{
                    totalIncome,
                    totalExpense,
                    totalReceivable,
                    totalPatients
                }}
                transactions={transactions}
            />

            {/* Table Controls */}
            <div className="flex justify-between items-center mt-8 mb-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar movimiento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-sans text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">
                    <Filter size={16} />
                    <span>Filtrar</span>
                </button>
            </div>

            {/* Systematic DataTable */}
            <div className="mt-4">
                {/* @ts-ignore */}
                <DataTable
                    data={filteredTransactions}
                    // @ts-ignore
                    columns={columns}
                    emptyMessage="No se encontraron movimientos financieros."
                />
            </div>
        </PageContainer>
    );

}
