import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Download, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { financeService } from '../services/financeService';
import type { Transaction } from '../services/financeService';

export default function Finanzas() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await financeService.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (t.description || '').toLowerCase().includes(searchLower) ||
            (t.treatment_name || '').toLowerCase().includes(searchLower) ||
            (t.patient_name || '').toLowerCase().includes(searchLower) ||
            (t.category || '').toLowerCase().includes(searchLower) ||
            (t.issuer_name || '').toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Transacciones Globales</h1>
                    <p className="text-slate-500 mt-1">Historial unificado de todos los movimientos de la clínica.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" leftIcon={<Download size={16} />}>Exportar CSV</Button>
                </div>
            </div>

            <Card className="overflow-hidden" noPadding>
                {/* Filters Bar */}
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por concepto, paciente o doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5dc0bb] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Movimiento</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Información/Categoría</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Fecha</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest">Método</th>
                                <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Cargando transacciones...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron movimientos.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 leading-tight">
                                                        {t.description || t.treatment_name || 'Sin Concepto'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">
                                                        {t.patient_name || t.issuer_name || 'General'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="neutral" className="w-fit text-[10px] font-bold">
                                                    {t.category || 'Varios'}
                                                </Badge>
                                                {t.doctor_name && (
                                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                        Dr. {t.doctor_name}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {t.date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-100 rounded-lg uppercase">
                                                {t.method || 'Efectivo'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
