import { useState, useEffect } from 'react';
import { Search, Download, Filter, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { financeService } from '../services/financeService';
import type { Transaction } from '../services/financeService';
import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';

import NewIncomeModal from '../components/NewIncomeModal';

export default function Ingresos() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleCreate = async (data: any) => {
        try {
            await financeService.createTransaction({
                amount: Number(data.amount),
                description: data.treatment_name || 'Ingreso Manual', // Fallback description
                treatment_name: data.treatment_name,
                patient_name: data.patient_name,
                date: data.date,
                method: data.method,
                status: data.status,
                type: 'income'
            });
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error creating income:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredTransactions = transactions.filter(t =>
        t.treatment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageContainer>
            {/* Header Area matching Reference */}
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

            <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl" noPadding>
                {/* Reference Toolbar: Search | Showing | Filter | Export | Add */}
                <div className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100">

                    {/* Search */}
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar paciente o tratamiento..."
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
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#5dc0bb]/20 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: '#5dc0bb' }}
                        >
                            <Plus size={18} />
                            <span>Nuevo Ingreso</span>
                        </button>
                    </div>
                </div>

                {/* Table matching "Product" reference */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white">
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hora</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código Pago</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paciente</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tratamiento</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duración</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sillón</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Método</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monto</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-12 text-center text-slate-400">
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-12 text-center text-slate-400">
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
                                            <span className="inline-block px-2 py-1 bg-cyan-50 text-cyan-600 rounded text-xs font-bold whitespace-nowrap">
                                                {t.payment_code || 'PAG-0000'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-bold text-slate-900 uppercase">
                                                {t.patient_name || 'Paciente General'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 max-w-[200px] truncate" title={t.treatment_name}>
                                            {t.treatment_name || 'Consulta General'}
                                        </td>
                                        <td className="px-4 py-4 text-slate-500 text-center">
                                            {/* Duration placeholder or real data if available later */}
                                            {t.date ? '60 min' : '-'}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 text-xs">
                                            {t.doctor_name || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-slate-500 text-xs">
                                            {(typeof t.id === 'number' ? t.id : String(t.id).charCodeAt(0)) % 2 === 0 ? 'Sillón 1' : 'Sillón 2'}
                                        </td>
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
                                        <td className="px-4 py-4 font-bold text-orange-500 whitespace-nowrap">
                                            ${Number(t.balance || 0).toFixed(2).replace('.', ',')}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors shadow-sm">
                                                <Trash2 size={14} />
                                                ELIMINAR
                                            </button>
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
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">3</button>
                        <span className="text-slate-400 text-xs">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">10</button>
                    </div>

                    <button className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <span>Next</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </Card>

            <NewIncomeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreate}
            />
        </PageContainer>
    );
}
