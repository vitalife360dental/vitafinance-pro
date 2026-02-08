import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { financeService } from '../services/financeService';
import type { Transaction } from '../services/financeService';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { NewExpenseModal } from '../components/NewExpenseModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

export default function Egresos() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | number | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const all = await financeService.getTransactions();
            const expenses = all.filter(t => t.type === 'expense');
            setTransactions(expenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (data: any) => {
        try {
            await financeService.createTransaction({
                ...data,
                description: data.concept, // Map UI 'concept' to DB 'description'
                payment_code: data.invoice,
                invoice_number: data.invoice, // NEW: Save to invoice_number column
                type: 'expense'
            });
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error creating expense:', error);
            throw error;
        }
    };

    const handleUpdate = async (data: any) => {
        if (!editingTransaction) return;
        try {
            await financeService.updateTransaction(editingTransaction.id, {
                ...data,
                description: data.concept, // Map UI 'concept' to DB 'description'
                payment_code: data.invoice,
                invoice_number: data.invoice // NEW: Save to invoice_number column
            });
            setIsModalOpen(false);
            setEditingTransaction(null);
            loadData();
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    };

    const handleDeleteClick = (id: string | number) => {
        setTransactionToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await financeService.deleteTransaction(transactionToDelete);
            setDeleteModalOpen(false);
            setTransactionToDelete(null);
            loadData();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageContainer>
            <PageHeader
                title="Gestión de Egresos"
                subtitle="Control detallado de gastos operativos y pagos."
            >
                <button
                    onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-[#5dc0bb]/20 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: '#5dc0bb' }}
                >
                    <Plus size={18} />
                    <span>Registrar Gasto</span>
                </button>
            </PageHeader>

            <Card className="overflow-hidden" noPadding>
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-white">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por descripción o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5dc0bb]/20 focus:border-[#5dc0bb] transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Proveedor</th>
                                <th className="px-6 py-4">RUC</th>
                                <th className="px-6 py-4">No. Factura</th>
                                <th className="px-6 py-4">Concepto</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                                        Cargando egresos...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron egresos.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                                    {(t.issuer_name || 'EXP').slice(0, 3)}
                                                </div>
                                                <span className="font-bold text-slate-900">{t.issuer_name || 'Proveedor General'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                            {t.issuer_ruc || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                            {t.invoice_number || t.payment_code || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {t.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <Badge variant="neutral">{t.category || 'General'}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">{t.date}</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs uppercase">{t.method}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                                            ${(t.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }}
                                                    className="p-2 text-slate-400 hover:text-[#5dc0bb] hover:bg-[#5dc0bb]/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(t.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <NewExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={editingTransaction ? handleUpdate : handleCreate}
                initialData={editingTransaction ? {
                    ...editingTransaction,
                    invoice: editingTransaction.payment_code
                } : undefined}
                mode={editingTransaction ? 'edit' : 'create'}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Gasto"
                message="¿Estás seguro de que deseas eliminar este registro? Esta acción afectará el balance y no se puede deshacer."
            />
        </PageContainer>
    );
}
