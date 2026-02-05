import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Filter, ChevronDown, Download, Edit, Trash2 } from 'lucide-react';
import { financeService } from '../services/financeService';
import NewExpenseModal from '../components/NewExpenseModal';
import EditIncomeModal from '../components/EditIncomeModal';
import { PageContainer } from '../components/ui/PageContainer';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
interface Transaction {
    id: number | string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    payment_code: string;
    patient_name: string;
    doctor_name?: string;
    treatment_name: string;
    duration?: string;
    chair?: string;
    method?: string;
    status: string;
    invoice?: string;
    balance: number;
    time: string;
    daysCounter: number;
    // Extended properties for modals
    category_name?: string;
    issuer_ruc?: string;
}

export default function CajaDiaria() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState('');


    // Modal State
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

    const loadTransactions = async () => {
        try {

            const data = await financeService.getTransactions();

            // Map service data to UI structure
            // Note: service explicitly normalizes types to 'income' or 'expense'
            // We need to trust that "Other App" data will come in as 'income' via service logic
            const formatted: Transaction[] = data.map((t: any) => ({
                id: t.id,
                date: t.date,
                daysCounter: 0, // Logic to be implemented if needed
                time: t.displayTime,
                payment_code: t.payment_code || '-',
                patient_name: t.patient_name || 'Paciente Externo', // Fallback for external app
                treatment_name: t.treatment_name || t.description || 'Sin concepto',
                duration: t.duration || '-',
                doctor_name: t.doctor_name || '-',
                chair: t.chair || '-',
                method: t.method || 'Efectivo',
                status: t.status || 'PAGADO',
                amount: Number(t.amount),
                balance: Number(t.balance || 0),
                type: t.type,
                invoice: t.invoice,
                category_name: t.category,
                issuer_ruc: t.issuer_ruc
            }));
            setTransactions(formatted);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const filteredTransactions = transactions.filter(t =>
        (t.patient_name && t.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.payment_code && t.payment_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.doctor_name && t.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEditClick = (transaction: Transaction) => {
        // Map transaction to modal format
        const modalData = {
            id: transaction.id,
            amount: transaction.amount,
            date: transaction.date,
            method: transaction.method,
            // Expense fields
            concept: transaction.treatment_name,
            category: transaction.category_name,
            invoice: transaction.invoice,
            issuer_ruc: transaction.issuer_ruc,
            // Income fields
            payment_code: transaction.payment_code,
            patient_name: transaction.patient_name
        };

        setEditingTransaction(modalData);

        if (transaction.type === 'expense') {
            setIsExpenseModalOpen(true);
        } else {
            setIsIncomeModalOpen(true);
        }
    };

    const handleDeleteClick = async (transaction: Transaction) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
            try {
                const success = await financeService.deleteTransaction(Number(transaction.id));
                if (success) {
                    loadTransactions();
                } else {
                    alert('Error al eliminar la transacción');
                }
            } catch (error) {
                console.error('Error eliminating:', error);
                alert('Ocurrió un error al intentar eliminar');
            }
        }
    };

    const handleSaveExpense = async (data: any) => {
        try {
            const success = await financeService.updateTransaction(editingTransaction.id, {
                amount: Number(data.amount),
                date: data.date,
                category_id: undefined,
                treatment_name: data.concept,
                description: data.concept,
                category_name: data.category,
                method: data.method,
                // @ts-ignore
                invoice: data.invoice,
                issuer_ruc: data.issuer_ruc,
                type: 'expense'
            });

            if (success) {
                loadTransactions();
                setIsExpenseModalOpen(false);
                setEditingTransaction(null);
            } else {
                alert("Error al actualizar el gasto");
            }
        } catch (error) {
            console.error(error);
            alert("Error al guardar cambios");
        }
    };

    const handleSaveIncome = async (data: any) => {
        try {
            const success = await financeService.updateTransaction(editingTransaction.id, {
                amount: Number(data.amount),
                date: data.date,
                method: data.method,
                description: data.concept,
                treatment_name: data.concept,
                payment_code: data.payment_code,
                type: 'income'
            });

            if (success) {
                loadTransactions();
                setIsIncomeModalOpen(false);
                setEditingTransaction(null);
            } else {
                alert("Error al actualizar el ingreso");
            }
        } catch (error) {
            console.error(error);
            alert("Error al guardar cambios");
        }
    };

    const columns = [
        { header: 'FECHA', accessorKey: 'date', className: 'whitespace-nowrap', cell: (t: Transaction) => <span className="text-slate-600 font-medium">{t.date}</span> },
        {
            header: 'DÍAS',
            className: 'whitespace-nowrap',
            cell: (t: Transaction) => (
                <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-slate-100 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">{t.daysCounter}</span>
                    <span className="text-[8px] text-slate-400 uppercase">DÍAS</span>
                </div>
            )
        },
        { header: 'HORA', accessorKey: 'time', className: 'whitespace-nowrap', cell: (t: Transaction) => <span className="text-xs text-slate-500 font-mono whitespace-pre-line">{t.time.replace(' ', '\n')}</span> },
        {
            header: 'CÓDIGO',
            className: 'whitespace-nowrap',
            cell: (t: Transaction) => <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{t.payment_code}</span>
        },
        { header: 'PACIENTE', accessorKey: 'patient_name', className: 'font-bold text-slate-700 uppercase whitespace-nowrap' },
        {
            header: 'TRATAMIENTO',
            className: 'whitespace-nowrap',
            cell: (t: Transaction) => <div className="max-w-[200px] truncate text-xs text-slate-600" title={t.treatment_name}>{t.treatment_name}</div>
        },
        { header: 'DOCTOR', accessorKey: 'doctor_name', className: 'text-xs text-slate-600 whitespace-nowrap' },
        {
            header: 'MÉTODO',
            className: 'whitespace-nowrap',
            cell: (t: Transaction) => <Badge variant="neutral">{t.method || 'Efectivo'}</Badge>
        },
        {
            header: 'ESTADO',
            className: 'whitespace-nowrap',
            cell: (t: Transaction) => <Badge variant={t.status === 'CANCELADO' || t.status === 'PAGADO' ? 'success' : 'warning'}>{t.status}</Badge>
        },
        {
            header: 'FACTURA',
            className: 'whitespace-nowrap',
            cell: (t: Transaction) => t.invoice ? <span className="font-mono text-xs text-slate-500">#{t.invoice}</span> : <span className="text-slate-300">-</span>
        },
        {
            header: 'MONTO',
            accessorKey: 'amount',
            className: 'text-right whitespace-nowrap',
            cell: (t: Transaction) => (
                <span className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-slate-800'}`}>
                    {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                </span>
            )
        },
        {
            header: 'SALDO',
            accessorKey: 'balance',
            className: 'text-right whitespace-nowrap',
            cell: (t: Transaction) => <span className={`font-bold ${t.balance > 0 ? 'text-amber-500' : 'text-slate-400'}`}>${t.balance.toFixed(2)}</span>
        },
        {
            header: 'ACCIONES',
            className: 'whitespace-nowrap',
            cell: (t: Transaction) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(t); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(t); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const HeaderActions = (
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">
                <Download size={18} />
                <span>Exportar</span>
            </button>
            <button
                onClick={() => {
                    setEditingTransaction(null); // Clear previous edit state
                    setIsExpenseModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
                <Plus size={18} />
                <span>Nueva Transacción</span>
            </button>
        </div>
    );

    return (
        <PageContainer>
            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            Ingresos <span className="text-2xl">📋</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Fuente única de verdad de todos los movimientos (Ingresos y Egresos).</p>
                    </div>
                    {HeaderActions}
                </div>

                {/* Toolbar Section */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por paciente, código o doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-sans"
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
                            <Calendar size={16} />
                            <span>Fecha</span>
                            <ChevronDown size={14} />
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
                            <Filter size={16} />
                            <span>Filtrar</span>
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <DataTable
                            data={filteredTransactions}
                            // @ts-ignore
                            columns={columns}
                            emptyMessage="No se encontraron movimientos registrados."
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isExpenseModalOpen && (
                <NewExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={() => {
                        setIsExpenseModalOpen(false);
                        setEditingTransaction(null);
                    }}
                    onSave={handleSaveExpense}
                    initialData={editingTransaction}
                />
            )}

            {isIncomeModalOpen && (
                <EditIncomeModal
                    isOpen={isIncomeModalOpen}
                    onClose={() => {
                        setIsIncomeModalOpen(false);
                        setEditingTransaction(null);
                    }}
                    onSave={handleSaveIncome}
                    initialData={editingTransaction}
                />
            )}
        </PageContainer>
    );
}
