import { useState } from 'react';
import { UserRound, AlertCircle, CheckCircle2, Search } from 'lucide-react';

export default function ProductionDoctors({ data }: { data: any }) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!data) return null;
    const { doctors } = data;

    const filteredDoctors = doctors.filter((doc: any) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            {/* Header / Summary */}
            <div className="bg-[#5dc0bb]/10 border border-[#5dc0bb]/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white text-[#5dc0bb] rounded-full shadow-sm">
                        <UsersIcon size={24} />
                    </div>
                    <div>
                        <h3 className="text-[#5dc0bb] font-bold text-lg">Performance del Equipo Médico</h3>
                        <p className="text-slate-600 text-sm">Este reporte muestra el aporte neto de cada profesional después de pagar sus honorarios.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5dc0bb]/20 focus:border-[#5dc0bb] outline-none transition-all w-64"
                        />
                    </div>
                    <div className="text-right hidden md:block">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</span>
                        <p className="text-2xl font-bold text-slate-700">{doctors.length}</p>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 font-bold">Doctor</th>
                                <th className="px-6 py-4 font-bold text-center">Pacientes Atendidos</th>
                                <th className="px-6 py-4 font-bold text-right">Facturación Generada</th>
                                <th className="px-6 py-4 font-bold text-right text-orange-500">Aranceles Pagados</th>
                                <th className="px-6 py-4 font-bold text-right text-emerald-600">Aporte Neto (Clinica)</th>
                                <th className="px-6 py-4 font-bold text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron doctores.
                                    </td>
                                </tr>
                            ) : (
                                filteredDoctors.map((doc: any, i: number) => {
                                    // Simple logic for status
                                    const isTopPerformer = i < 3 && searchTerm === ''; // Only show top performer badge if not searching or if it's really the top
                                    const isLowMargin = doc.netContribution < (doc.billing * 0.2);

                                    return (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isTopPerformer ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {doc.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-700">{doc.name}</p>
                                                        {isTopPerformer && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">Top Productor</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-600">{doc.attentions}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-600">
                                                ${doc.billing.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-orange-500">
                                                <div className="flex flex-col items-end">
                                                    <span>-${doc.tariffs.toFixed(2)}</span>
                                                    <span className="text-[10px] text-orange-400">{Math.round((doc.commissionRate || 0.33) * 100)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                                                    ${doc.netContribution.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isLowMargin ? (
                                                    <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold">
                                                        <AlertCircle size={14} /> Baja Rentabilidad
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-bold">
                                                        <CheckCircle2 size={14} /> Óptimo
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const UsersIcon = ({ size }: { size: number }) => (
    <UserRound size={size} />
);
