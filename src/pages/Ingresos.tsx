import { useState, useEffect } from 'react';
import { Search, Download, Filter, Plus, ChevronLeft, ChevronRight, Trash2, Edit2, ShoppingBag, Stethoscope } from 'lucide-react';
import { financeService } from '../services/financeService';
import type { Transaction } from '../services/financeService';
import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';

import NewIncomeModal from '../components/NewIncomeModal';
import NewOtherIncomeModal from '../components/NewOtherIncomeModal';

export default function Ingresos() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [activeTab, setActiveTab] = useState<'treatments' | 'others'>('treatments');

    const loadData = async () => {
        setLoading(true);
        try {
            const all = await financeService.getTransactions();
            const income = all.filter(t => t.type === 'income');
            setTransactions(income);
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
        return (
            t.treatment_name?.toLowerCase().includes(searchLower) ||
            t.patient_name?.toLowerCase().includes(searchLower) ||
            t.description?.toLowerCase().includes(searchLower) ||
            (t.invoice_number && t.invoice_number.toLowerCase().includes(searchLower))
        );
    });

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
                        <span className="text-sm font-medium text-slate-700">Dra. Lopez</span>
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

                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Filter size={18} />
                            <span>Filtros</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
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
                <div className="overflow-x-auto">
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
                                    <td colSpan={14} className="px-6 py-12 text-center text-slate-400">
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron registros.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-4 text-slate-500 font-medium whitespace-nowrap">
                                            {new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                                            {t.transaction_time ? t.transaction_time.slice(0, 5) + (parseInt(t.transaction_time) >= 12 ? ' p. m.' : ' a. m.') : '12:00 p. m.'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-slate-600 text-xs font-medium">
                                                {t.invoice_number || '-'}
                                            </span>
                                        </td>

                                        {/* Treatments Columns */}
                                        {activeTab === 'treatments' && (
                                            <>
                                                <td className="px-4 py-4">
                                                    <span className="font-bold text-slate-900 uppercase">
                                                        {t.patient_name || 'Paciente General'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-600 max-w-[200px] truncate" title={t.treatment_name}>
                                                    {t.treatment_name || 'Consulta General'}
                                                </td>
                                                <td className="px-4 py-4 text-slate-600 text-xs">
                                                    {t.doctor_name || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-slate-500 text-xs">
                                                    {(typeof t.id === 'number' ? t.id : String(t.id).charCodeAt(0)) % 2 === 0 ? 'Sillón 1' : 'Sillón 2'}
                                                </td>
                                            </>
                                        )}

                                        {/* Others Columns */}
                                        {activeTab === 'others' && (
                                            <td className="px-4 py-4 text-slate-900 font-medium">
                                                {t.description || t.treatment_name || 'Ingreso Vario'}
                                            </td>
                                        )}

                                        <td className="px-4 py-4">
                                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wide">
                                                {t.method || 'Efectivo'}
                                            </span>
                                        </td>
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
                                        <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                                            +${Number(t.amount).toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    onClick={() => handleEdit(t)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold transition-colors shadow-sm"
                                                >
                                                    <Edit2 size={14} />
                                                    EDITAR
                                                </button>
                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors shadow-sm">
                                                    <Trash2 size={14} />
                                                    ELIMINAR
                                                </button>
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
            {activeTab === 'treatments' && (
                <NewIncomeModal
                    isOpen={isModalOpen}
                    initialData={selectedTransaction}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleCreateOrUpdate}
                />
            )}

            {activeTab === 'others' && (
                <NewOtherIncomeModal
                    isOpen={isModalOpen}
                    initialData={selectedTransaction}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleCreateOrUpdate}
                />
            )}
        </PageContainer>
    );
}
