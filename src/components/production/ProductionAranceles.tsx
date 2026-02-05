import { Search } from 'lucide-react';
import { useState } from 'react';

export default function ProductionAranceles({ data }: { data: any }) {
    if (!data) return null;
    // We use 'treatments' from data as it contains the margin analysis we need
    const { treatments } = data;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTreatments = treatments.filter((t: any) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-700 text-lg">Análisis de Aranceles y Márgenes</h3>
                    <p className="text-slate-400 text-sm">Visualiza qué porcentaje de cada tratamiento se va en pago a doctores.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Filtrar tratamiento..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5dc0bb]/20 focus:border-[#5dc0bb] outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 font-bold">Tratamiento</th>
                            <th className="px-6 py-4 font-bold text-right">Precio Público</th>
                            <th className="px-6 py-4 font-bold text-right text-orange-500">Pago Dr. (Arancel)</th>
                            <th className="px-6 py-4 font-bold text-right text-red-400">Insumos (Est. 15%)</th>
                            <th className="px-6 py-4 font-bold text-right text-emerald-600">Margen Clínica</th>
                            <th className="px-6 py-4 font-bold text-right">% Margen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredTreatments.map((t: any, i: number) => {
                            // Re-calculate unit margin for clarity
                            const unitPrice = t.price / t.count;
                            const unitTariff = t.tariff / t.count;
                            const unitSupplies = t.supplies / t.count;
                            const unitMargin = unitPrice - unitTariff - unitSupplies;
                            const marginPct = (unitMargin / unitPrice) * 100;

                            return (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-700">{t.name}</td>
                                    <td className="px-6 py-4 text-right font-medium">${unitPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-orange-500">-${unitTariff.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right text-red-400">-${unitSupplies.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">+${unitMargin.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${marginPct < 20 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {marginPct.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredTreatments.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        No se encontraron tratamientos con ese nombre.
                    </div>
                )}
            </div>
        </div>
    );
}
