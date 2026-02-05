import { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronDown, Edit, Trash2 } from 'lucide-react';
import NewExpenseModal from '../components/NewExpenseModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { financeService } from '../services/financeService';
import type { Category } from '../services/financeService';
import { PageLayout } from '../components/ui/PageLayout';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';

// Types derived from service
interface Transaction {
    id: number | string;
    amount: number;
    date: string;
    type: 'income' | 'expense';

    // New Fields
    payment_code?: string;
    patient_name?: string;
    doctor_name?: string;
    treatment_name?: string;
    concept?: string;
    status?: string;
    method?: string;
    balance?: number;
    duration?: string;
    chair?: string;
    time?: string;
    daysCounter?: number;
    invoice?: string;
    issuer_ruc?: string;
    category_name?: string;
}

export default function Egresos() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

    // Hardcode filter to 'expense'

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await financeService.getTransactions();
            const formatted: Transaction[] = data.map((t: any) => ({
                id: t.id,
                amount: t.amount,
                date: t.date,
                type: t.type, // Already normalized by service
                payment_code: t.payment_code || '-',
                patient_name: t.patient_name,
                doctor_name: t.doctor_name,
                treatment_name: t.treatment_name,
                concept: t.concept,
                status: t.status || 'PAGADO',
                method: t.method || 'Efectivo',
                balance: t.balance,
                duration: '-',
                chair: '-',
                time: t.displayTime,
                daysCounter: 0,
                invoice: (t.payment_code && t.payment_code !== '-') ? t.payment_code : (t.invoice || ''),
                issuer_ruc: t.issuer_ruc,
                category_name: t.category
            }));
            setTransactions(formatted);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await financeService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    useEffect(() => {
        loadTransactions();
        loadCategories();
    }, []);

    const filteredTransactions = transactions.filter(t => t.type === 'expense');

    const handleSaveExpense = async (expenseData: any) => {
        try {
            const payload = {
                date: expenseData.date,
                amount: Number(expenseData.amount),
                description: expenseData.concept,
                treatment_name: expenseData.concept,
                type: 'expense' as const, // Enforced Type
                category_id: categories.find(c => c.name === expenseData.category)?.id,
                category_name: expenseData.category,
                payment_code: expenseData.invoice, // Save Invoice Number
                issuer_ruc: expenseData.issuer_ruc, // Save RUC
                method: expenseData.method,
                status: 'PAGADO',
                balance: 0
            };

            if (editingTransaction) {
                await financeService.updateTransaction(Number(editingTransaction.id), payload);
            } else {
                await financeService.createTransaction(payload);
            }

            await loadTransactions();
            setIsModalOpen(false);
            setEditingTransaction(null);
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Error al guardar el gasto');
        }
    };

    const handleEditClick = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleDeleteClick = (id: number) => {
        setTransactionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;

        try {
            await financeService.deleteTransaction(transactionToDelete);
            await loadTransactions();
            setIsDeleteModalOpen(false);
            setTransactionToDelete(null);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Error al eliminar el gasto');
            setIsDeleteModalOpen(false);
        }
    };

    const columns = [
        {
            header: 'FECHA',
            accessorKey: 'date' as keyof Transaction,
            className: 'w-[100px] whitespace-nowrap font-medium'
        },
        {
            header: 'No. FACTURA',
            cell: (tx: Transaction) => (
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {tx.payment_code !== '-' ? tx.payment_code : tx.invoice || '-'}
                </span>
            )
        },
        {
            header: 'RUC EMISOR',
            cell: (tx: Transaction) => (
                <span className="font-mono text-xs text-slate-500">
                    {tx.issuer_ruc || '-'}
                </span>
            )
        },
        {
            header: 'CATEGORÍA',
            cell: (tx: Transaction) => (
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                    {tx.category_name || 'General'}
                </span>
            )
        },
        {
            header: 'CONCEPTO / TRATAMIENTO',
            cell: (tx: Transaction) => (
                <div className="text-sm truncate max-w-[200px]" title={tx.treatment_name}>
                    {tx.treatment_name}
                </div>
            )
        },
        {
            header: 'MÉTODO',
            cell: (tx: Transaction) => (
                <Badge variant="neutral">{tx.method || 'Efectivo'}</Badge>
            )
        },
        {
            header: 'ESTADO',
            cell: (tx: Transaction) => (
                <Badge variant={tx.status === 'CANCELADO' || tx.status === 'PAGADO' ? 'success' : 'warning'}>
                    {tx.status}
                </Badge>
            )
        },
        {
            header: 'MONTO',
            cell: (tx: Transaction) => (
                <span className="font-bold text-red-500">
                    -${Number(tx.amount).toFixed(2)}
                </span>
            ),
            className: 'text-right'
        },
        {
            header: 'ACCIONES',
            cell: (tx: Transaction) => (
                <div className="flex justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(tx); }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                        title="Editar Gasto"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(Number(tx.id)); }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        title="Eliminar Gasto"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando egresos...</div>;

    const HeaderActions = (
        <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5DC0BB] hover:bg-[#4aa8a3] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-[#5DC0BB]/20 transition-all flex items-center gap-2 text-sm"
        >
            <Plus size={18} />
            Registrar Gasto
        </button>
    );

    return (
        <PageLayout
            title="Egresos 💸"
            subtitle="Control de gastos y compras."
            actions={HeaderActions}
        >
            {/* Table Controls (Search/Filter) */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por concepto..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium">
                    <Filter size={14} />
                    <span>Filtrar</span>
                    <ChevronDown size={14} />
                </button>
            </div>

            {/* Detailed Table */}
            <DataTable
                data={filteredTransactions}
                columns={columns}
                emptyMessage="No hay egresos registrados."
            />

            <NewExpenseModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveExpense}
                initialData={editingTransaction ? {
                    concept: editingTransaction.concept,
                    amount: editingTransaction.amount,
                    date: editingTransaction.date,
                    category: editingTransaction.category_name,
                    method: editingTransaction.method,
                    invoice: editingTransaction.invoice,
                    issuer_ruc: editingTransaction.issuer_ruc
                } : null}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                message="¿Estás seguro de que deseas eliminar este gasto? Esta acción eliminará permanentemente el registro y no se podrá recuperar."
            />
        </PageLayout>
    );
}

