import { useState, useEffect } from 'react';
import { Search, Download, Filter, Plus, ChevronLeft, ChevronRight, Trash2, Edit2, ShoppingBag, Stethoscope } from 'lucide-react';
import { financeService } from '../services/financeService';
import type { Transaction } from '../services/financeService';
import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';

import NewIncomeModal from '../components/NewIncomeModal';
import NewOtherIncomeModal from '../components/NewOtherIncomeModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';

const safeDate = (dateStr: string) => {
    try {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Fecha Inválida';
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
        return 'Error Fecha';
    }
};

export default function Ingresos() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [activeTab, setActiveTab] = useState<'treatments' | 'others'>('treatments');
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const loadData = async () => {
        setLoading(true);
        try {
            const all = await financeService.getTransactions();
            const sanitized = all
                .filter(t => t.type === 'income')
                .map(t => ({
                    ...t,
                    id: t.id ?? Math.random(), // Fallback ID
                    date: t.date || new Date().toISOString(),
                    amount: Number(t.amount) || 0,
                    description: t.description || '',
                    treatment_name: t.treatment_name || '',
                    patient_name: t.patient_name || '',
                    doctor_name: t.doctor_name || '',
                    invoice_number: t.invoice_number || '',
                    status: t.status || 'PENDIENTE',
                    method: t.method || 'Efectivo',
                    transaction_time: t.transaction_time || '12:00:00'
                }));
            setTransactions(sanitized);
        } catch (error) {
            console.error('Error loading income:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (data: any) => {
        try {
            const isOther = activeTab === 'others';
            // Explicitly cast 'income' to the literal type expected by Transaction
            const typeValue: 'income' = 'income';

            const payload = {
                amount: Number(data.amount),
                description: isOther ? data.description : (data.treatment_name || 'Ingreso Manual'),
                treatment_name: isOther ? data.description : data.treatment_name,
                patient_name: isOther ? 'Cliente General' : data.patient_name, // Default for others
                doctor_name: isOther ? null : data.doctor_name, // Important: Null for others
                date: data.date,
                method: data.method,
                status: data.status,
                type: typeValue, // Typed correctly
                invoice_number: data.invoice_number
            };

            if (selectedTransaction) {
                await financeService.updateTransaction(selectedTransaction.id, payload);
            } else {
                await financeService.createTransaction(payload);
            }
            setIsModalOpen(false);
            setSelectedTransaction(null);
            loadData();
        } catch (error) {
            console.error('Error saving income:', error);
        }
    };

    const handleEdit = (t: Transaction) => {
        setSelectedTransaction(t);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedTransaction(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string | number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        console.log('🗑️ Deleting Transaction ID:', deleteId, 'Type:', typeof deleteId);

        // 1. Optimistic Update
        // Ensure type safety by comparing as strings
        setTransactions(prev => prev.filter(t => String(t.id) !== String(deleteId)));

        // NOTE: We do NOT close the modal here (setDeleteId(null)) 
        // because the DeleteConfirmationModal handles the await and then closes itself.

        try {
            // 2. Perform actual background deletion
            await financeService.deleteTransaction(deleteId);
            console.log('✅ Delete successful in backend');
        } catch (error) {
            console.error('❌ Error deleting transaction:', error);
            alert('Error al eliminar el ingreso. Por favor recargue la página.');
            loadData(); // Revert on error
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter based on Tab AND Search
    // Filter based on Tab AND Search
    const filteredTransactions = transactions.filter(t => {
        // Tab Filter

        // External data (not 'VitaFinance') should ALWAYS be in Treatments
        // If source is undefined, assume it's external (legacy/safe fallback) or handle accordingly. 
        // Based on financeService, local has 'VitaFinance', external has 'DentalFlow'.
        const isExternal = t.source !== 'VitaFinance';

        // For local data (VitaFinance), we check if it has a doctor
        const hasDoctor = !!t.doctor_name && t.doctor_name !== '-';

        if (activeTab === 'treatments') {
            // Show if it's external OR (local AND has doctor)
            if (isExternal) return true;
            if (!hasDoctor) return false;
        }

        if (activeTab === 'others') {
            // Show ONLY if it's local AND has no doctor
            if (isExternal) return false;
            // Also exclude if it IS a treatment (has doctor)
            if (hasDoctor) return false;
        }

        // Search Filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            t.treatment_name?.toLowerCase().includes(searchLower) ||
            t.patient_name?.toLowerCase().includes(searchLower) ||
            t.description?.toLowerCase().includes(searchLower) ||
            (t.invoice_number && String(t.invoice_number).toLowerCase().includes(searchLower))
        );

        if (!matchesSearch) return false;

        // Date Range Filter
        if (showFilters && (dateRange.start || dateRange.end)) {
            const tDate = new Date(t.date).getTime();
            if (dateRange.start && tDate < new Date(dateRange.start).getTime()) return false;
            // End date: set to end of day to include the selected day
            if (dateRange.end) {
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                if (tDate > endDate.getTime()) return false;
            }
        }

        return true;
    });

    const handleExport = () => {
        const headers = ['Fecha', 'Hora', 'Factura', 'Paciente', 'Tratamiento/Descripción', 'Doctor', 'Monto', 'Método', 'Estado', 'Origen'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(t => [
                t.date,
                t.transaction_time || '-',
                t.invoice_number || '-',
                `"${t.patient_name || '-'}"`,
                `"${t.treatment_name || t.description || '-'}"`,
                `"${t.doctor_name || '-'}"`,
                t.amount,
                t.method,
                t.status,
                t.source
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ingresos_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <PageContainer>
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ingresos</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span>Inicio</span>
                        <span>/</span>
                        <span className="text-[#5dc0bb]">Ingresos</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200">
                        <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">JUAN CARLOS ZURITA</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('treatments')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'treatments'
                        ? 'bg-[#5dc0bb] text-white shadow-lg shadow-[#5dc0bb]/30'
                        : 'bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <Stethoscope size={18} />
                    Tratamientos
                </button>
                <button
                    onClick={() => setActiveTab('others')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'others'
                        ? 'bg-[#5dc0bb] text-white shadow-lg shadow-[#5dc0bb]/30'
                        : 'bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                >
                    <ShoppingBag size={18} />
                    Otros Ingresos
                </button>
            </div>

            <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl" noPadding>
                {/* Toolbar */}
                <div className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100">

                    {/* Search */}
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder={activeTab === 'treatments' ? "Buscar paciente, tratamiento..." : "Buscar concepto, factura..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#5dc0bb]/20 text-slate-600 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Actions Group */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-600 font-medium">
                            <span>Showing</span>
                            <select className="bg-transparent border-none p-0 pr-2 focus:ring-0 text-slate-900 font-bold cursor-pointer">
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>

                        {/* Date Filters (Collapsible or Inline) */}
                        {showFilters && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-[#5dc0bb]"
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-[#5dc0bb]"
                                />
                            </div>
                        )}

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-colors ${showFilters
                                ? 'bg-slate-100 border-slate-300 text-slate-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <Filter size={18} />
                            <span>Filtros</span>
                        </button>

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Download size={18} />
                            <span>Exportar</span>
                        </button>

                        <button
                            onClick={handleNew}
                            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#5dc0bb]/20 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: '#5dc0bb' }}
                        >
                            <Plus size={18} />
                            <span>{activeTab === 'treatments' ? 'Nuevo Tratamiento' : 'Nuevo Ingreso'}</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto notranslate" translate="no">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white">
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hora</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factura #</th>
                                {activeTab === 'treatments' && (
                                    <>
                                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paciente</th>
                                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tratamiento</th>
                                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sillón</th>
                                    </>
                                )}
                                {activeTab === 'others' && (
                                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concepto</th>
                                )}
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Método</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monto</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={12} className="px-6 py-12 text-center text-slate-400">
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={`${t.source}-${t.id}`} className="hover:bg-slate-50/50 transition-colors group">
                                        {/* 1. Date */}
                                        <td className="px-4 py-4 text-slate-500 font-medium whitespace-nowrap">
                                            <span>{safeDate(t.date)}</span>
                                        </td>

                                        {/* 2. Time */}
                                        <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                                            <span>{t.transaction_time ? t.transaction_time.slice(0, 5) + (parseInt(t.transaction_time) >= 12 ? ' p. m.' : ' a. m.') : '12:00 p. m.'}</span>
                                        </td>

                                        {/* 3. Invoice # */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1 group/edit">
                                                <span className="text-slate-300 text-[10px] font-mono select-none">#</span>
                                                <input
                                                    type="text"
                                                    defaultValue={t.invoice_number || ''}
                                                    placeholder="---"
                                                    className="w-20 bg-transparent text-xs font-mono text-slate-600 border-b border-dashed border-transparent group-hover/edit:border-slate-300 focus:border-[#5dc0bb] focus:outline-none focus:ring-0 transition-all placeholder:text-slate-300"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                    onBlur={async (e) => {
                                                        const newVal = e.target.value.trim();
                                                        if (newVal !== (t.invoice_number || '')) {
                                                            try {
                                                                // Optimistic update locally could be done here, but safe way:
                                                                await financeService.updateTransaction(t.id, { invoice_number: newVal });
                                                                // Ideally, we toast success, but for now we just let it stick
                                                                // We don't reload *everything* to keep it snappy, unless necessary
                                                            } catch (err) {
                                                                console.error("Failed to update invoice", err);
                                                                // Revert?
                                                                e.target.value = t.invoice_number || '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* CONDITIONAL COLUMNS: TREATMENTS */}
                                        {activeTab === 'treatments' && (
                                            <>
                                                {/* 4. Patient */}
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-bold text-slate-700 block max-w-[150px] truncate" title={t.patient_name}>
                                                        {t.patient_name || 'Paciente General'}
                                                    </span>
                                                </td>
                                                {/* 5. Treatment */}
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-slate-600 block max-w-[200px] truncate" title={t.treatment_name || t.description}>
                                                        {t.treatment_name || t.description || 'Consulta'}
                                                    </span>
                                                </td>
                                                {/* 6. Doctor */}
                                                <td className="px-4 py-4">
                                                    <span className="text-xs font-medium text-slate-600 bg-teal-50 text-teal-700 px-2 py-1 rounded-full whitespace-nowrap">
                                                        {t.doctor_name || 'Dr. General'}
                                                    </span>
                                                </td>
                                                {/* 7. Chair */}
                                                <td className="px-4 py-4 text-slate-500 text-xs text-center border-l border-slate-100">
                                                    {t.chair || '-'}
                                                </td>
                                            </>
                                        )}

                                        {/* CONDITIONAL COLUMNS: OTHERS */}
                                        {activeTab === 'others' && (
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {t.description || t.treatment_name || 'Ingreso Vario'}
                                                </span>
                                            </td>
                                        )}

                                        {/* 8. Method */}
                                        <td className="px-4 py-4">
                                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wide">
                                                {t.method || 'Efectivo'}
                                            </span>
                                        </td>

                                        {/* 9. Status */}
                                        <td className="px-4 py-4">
                                            <span className={`
                                                inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                                ${(t.status === 'CANCELADO' || t.status === 'PAGADO') ? 'bg-emerald-100 text-emerald-600' :
                                                    (t.status === 'ABONO') ? 'bg-orange-100 text-orange-600' :
                                                        'bg-slate-100 text-slate-500'}
                                            `}>
                                                {t.status === 'PAGADO' ? 'CANCELADO' : (t.status || 'PENDIENTE')}
                                            </span>
                                        </td>

                                        {/* 10. Amount */}
                                        <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                                            +${Number(t.amount).toFixed(2).replace('.', ',')}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                {t.source === 'DentalFlow' ? (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-md text-[10px] font-bold uppercase tracking-wider select-none cursor-help" title="Gestionar desde DentalFlow">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                        Solo Lectura
                                                    </span>
                                                ) : (
                                                    (role === 'admin' || role === 'super_admin') ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleEdit(t);
                                                                }}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold transition-colors shadow-sm"
                                                            >
                                                                <Edit2 size={14} />
                                                                EDITAR
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleDelete(t.id);
                                                                }}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 rounded text-xs font-bold transition-colors shadow-sm"
                                                            >
                                                                <Trash2 size={14} />
                                                                ELIMINAR
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-300 rounded border border-slate-100 text-[10px] select-none" title="Acceso restringido">
                                                            🔒 Solo Admin
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <button className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <ChevronLeft size={16} />
                        <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-white text-sm font-bold shadow-md shadow-[#5dc0bb]/20" style={{ backgroundColor: '#5dc0bb' }}>1</button>
                    </div>

                    <button className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <span>Next</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </Card>

            {/* Modals based on Active Tab */}
            {
                activeTab === 'treatments' && (
                    <NewIncomeModal
                        isOpen={isModalOpen}
                        initialData={selectedTransaction}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleCreateOrUpdate}
                    />
                )
            }

            {
                activeTab === 'others' && (
                    <NewOtherIncomeModal
                        isOpen={isModalOpen}
                        initialData={selectedTransaction}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleCreateOrUpdate}
                    />
                )
            }

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </PageContainer >
    );
}
