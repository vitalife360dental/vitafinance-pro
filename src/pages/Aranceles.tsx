import { useState, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { financeService } from '../services/financeService';
import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';

interface Arancel {
    id: string;
    name: string;
    category: string;
    duration: string;
    price: number;
    doctor_commission: number;
}

export default function Aranceles() {
    const [items, setItems] = useState<Arancel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await financeService.getAranceles();
            setItems(data);
        } catch (error) {
            console.error('Error loading aranceles:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageContainer>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Aranceles y Comisiones</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span>Configuración</span>
                        <span>/</span>
                        <span className="text-[#5dc0bb]">Aranceles</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#5dc0bb]/10 px-3 py-2 rounded-lg border border-[#5dc0bb]/20 text-[#5dc0bb]">
                        <Calculator size={18} />
                        <span className="text-sm font-bold">Comisión Automática: 33%</span>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl" noPadding>
                {/* Toolbar */}
                <div className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100">
                    {/* Search */}
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar tratamiento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#5dc0bb]/20 text-slate-600 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Download size={18} />
                            <span>Exportar</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-white">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tratamiento</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Duración</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Precio P.V.P</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#5dc0bb] uppercase tracking-wider text-right bg-[#5dc0bb]/5 border-l border-r border-slate-50">Comisión Dr. (33%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Cargando lista de precios...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron tratamientos.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {t.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-500">
                                            {t.duration}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-700">
                                            ${t.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-[#5dc0bb] bg-[#5dc0bb]/5 border-l border-r border-slate-50">
                                            ${t.doctor_commission.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                        Mostrando {filteredItems.length} tratamientos
                    </span>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50" disabled>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </Card>
        </PageContainer>
    );
}
