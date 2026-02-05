import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Armchair, Clock } from 'lucide-react';

const COLORS = ['#5dc0bb', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function ProductionChairs({ data }: { data: any }) {
    if (!data) return null;
    const { chairs } = data;

    return (
        <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Section */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-700 mb-2 w-full text-left">Distribución de Ingresos</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chairs}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="billing"
                                >
                                    {chairs.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `$${value.toFixed(2)}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Info Cards Section */}
                <div className="grid grid-cols-1 gap-4">
                    {chairs.map((chair: any, i: number) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between hover:border-[#5dc0bb] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#5dc0bb]/10 group-hover:text-[#5dc0bb] transition-colors">
                                    <Armchair size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700">{chair.name}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {chair.hours} horas uso</span>
                                        <span>•</span>
                                        <span>{chair.count} intervenciones</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-slate-800">${chair.billing.toFixed(2)}</p>
                                <p className="text-xs text-emerald-500 font-medium">${chair.hourlyRate.toFixed(0)} / hora</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-sm">Desglose de Rentabilidad por Unidad</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 font-bold">Unidad (Sillón)</th>
                            <th className="px-6 py-4 font-bold text-center">Tiempo Ocupado</th>
                            <th className="px-6 py-4 font-bold text-right">Facturación</th>
                            <th className="px-6 py-4 font-bold text-right text-emerald-600">Utilidad Neta</th>
                            <th className="px-6 py-4 font-bold text-right">Rentabilidad/Hr</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {chairs.map((c: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                                <td className="px-6 py-4 text-center text-slate-500">{c.hours} hrs</td>
                                <td className="px-6 py-4 text-right font-medium text-slate-600">${c.billing.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-500">${c.utility.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right text-slate-500">${c.hourlyRate.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
