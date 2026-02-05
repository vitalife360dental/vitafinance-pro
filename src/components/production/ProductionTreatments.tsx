import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export default function ProductionTreatments({ data }: { data: any }) {
    if (!data) return null;
    const { treatments } = data;
    const topTreatments = treatments.slice(0, 10);

    return (
        <div className="space-y-6 p-6">
            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-slate-700">Top 10 Tratamientos Más Rentables</h3>
                        <p className="text-xs text-slate-400">Ordenados por utilidad neta generada</p>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topTreatments} layout="vertical" margin={{ left: 100, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={180}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Utilidad']}
                            />
                            <Bar
                                dataKey="utility"
                                fill="#5dc0bb"
                                radius={[0, 4, 4, 0]}
                                barSize={24}
                                background={{ fill: '#f8fafc' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 font-bold">Tratamiento</th>
                            <th className="px-6 py-4 font-bold text-center">Cantidad</th>
                            <th className="px-6 py-4 font-bold text-right">Precio Promedio</th>
                            <th className="px-6 py-4 font-bold text-right text-emerald-600">Margen %</th>
                            <th className="px-6 py-4 font-bold text-right text-emerald-600">Utilidad Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {treatments.map((t: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                                        <Activity size={14} />
                                    </div>
                                    {t.name}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
                                        {t.count}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500">
                                    ${(t.price / t.count).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-500">
                                    {t.marginPercent.toFixed(1)}%
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-700">
                                    ${t.utility.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
