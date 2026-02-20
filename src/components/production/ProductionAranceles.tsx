import { Search } from 'lucide-react';
import { useState } from 'react';

export default function ProductionAranceles({ data }: { data: any }) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!data || !data.fullCatalog) return null;

    const filteredTreatments = data.fullCatalog.filter((t: any) =>
        t.treatment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-700 text-lg">Catálogo Completo de Rentabilidad</h3>
                    <p className="text-slate-400 text-sm">Visualiza la rentabilidad neta de todos los tratamientos aplicando los aranceles configurados al 40%, 70% o base.</p>
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
                <div className="max-h-[600px] overflow-y-auto w-full">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 font-bold">Tratamiento</th>
                                <th className="px-6 py-4 font-bold text-right">Precio P.V.P</th>
                                <th className="px-6 py-4 font-bold text-right text-orange-500">Pago Dr. (Arancel)</th>
                                <th className="px-6 py-4 font-bold text-right text-red-500">Insumos</th>
                                <th className="px-6 py-4 font-bold text-right text-rose-500">Laboratorio</th>
                                <th className="px-6 py-4 font-bold text-right text-red-400">Gasto Operativo</th>
                                <th className="px-6 py-4 font-bold text-right text-emerald-600">Margen Clínica</th>
                                <th className="px-6 py-4 font-bold text-center">% Margen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTreatments.map((t: any, i: number) => {
                                const marginPct = t.price > 0 ? (t.utility / t.price) * 100 : 0;
                                const tariffPct = t.tariffRate * 100;

                                return (
                                    <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${t.isBase ? 'bg-slate-50/10' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-slate-600 flex items-center gap-2">
                                            {t.isBase ? (
                                                <span className="w-2 h-2 rounded-full bg-slate-200" title="Arancel Base (33%)"></span>
                                            ) : (
                                                <span className="w-2 h-2 rounded-full bg-orange-400" title={`Arancel Especial (${tariffPct}%)`}></span>
                                            )}
                                            <div>
                                                {t.treatment}
                                                <div className="text-[10px] text-slate-400 font-normal">{t.category}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-700">${t.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-orange-500">
                                            -${t.tariff.toFixed(2)} <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded ml-1 font-bold">({tariffPct.toFixed(1)}%)</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-red-500">-${Number(t.supplies || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-rose-500">-${Number(t.lab || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right text-red-400">-${t.operationalCost.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-600">+${t.utility.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
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
                            No se encontraron registros.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
