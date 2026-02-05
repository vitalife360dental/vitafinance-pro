import { DollarSign, Users, Activity, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ProductionResume({ data }: { data: any }) {
    if (!data) return null;
    const { summary, raw } = data;

    // Helper for currency
    const fmt = (n: number) => `$${n.toFixed(2)}`;

    // Prepare chart data (Daily Net Production)
    // Group raw transactions by date
    const dailyDataMap: Record<string, { date: string; production: number; cost: number }> = {};

    raw.forEach((tx: any) => {
        const date = tx.displayDate;
        if (!dailyDataMap[date]) {
            dailyDataMap[date] = { date, production: 0, cost: 0 };
        }
        dailyDataMap[date].production += Number(tx.amount || 0);
        dailyDataMap[date].cost += (Number(tx.tariffCost || 0) + Number(tx.suppliesCost || 0));
    });

    // Convert to sorted array (last 14 days for cleaner view)
    const chartData = Object.values(dailyDataMap)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14);

    return (
        <div className="space-y-8 p-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Facturación Total"
                    value={fmt(summary.totalBilling)}
                    icon={DollarSign}
                    trend="+12%"
                    color="blue"
                />
                <KpiCard
                    title="Utilidad Neta"
                    value={fmt(summary.totalUtility)}
                    icon={Wallet}
                    trend="+8%"
                    color="emerald"
                />
                <KpiCard
                    title="Aranceles Pagados"
                    value={fmt(summary.totalTariffs)}
                    icon={Users}
                    trend="33%"
                    color="orange"
                />
                <KpiCard
                    title="Utilidad por Hora"
                    value={fmt(summary.hourlyUtility)}
                    icon={Activity}
                    subtitle="Promedio clínica"
                    color="purple"
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Line Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-6">Tendencia de Producción (Últimos 14 días)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5dc0bb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#5dc0bb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="production"
                                    stroke="#5dc0bb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorProd)"
                                    name="Facturación"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Bar Chart (Billing vs Cost) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-6">Ingreso vs Costos</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Facturación', value: summary.totalBilling, fill: '#5dc0bb' },
                                { name: 'Dr. (Aranceles)', value: summary.totalTariffs, fill: '#f59e0b' },
                                { name: 'Insumos', value: summary.totalSupplies, fill: '#ef4444' },
                                { name: 'Utilidad', value: summary.totalUtility, fill: '#10b981' }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px' }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[8, 8, 8, 8]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3 mt-4">
                        <LegendItem color="bg-[#5dc0bb]" label="Facturación Bruta" value={fmt(summary.totalBilling)} />
                        <LegendItem color="bg-amber-500" label="Pagado a Doctores" value={fmt(summary.totalTariffs)} />
                        <LegendItem color="bg-red-500" label="Costo Insumos (Est.)" value={fmt(summary.totalSupplies)} />
                        <div className="pt-2 border-t border-slate-100">
                            <LegendItem color="bg-emerald-500" label="Utilidad Neta" value={fmt(summary.totalUtility)} bold />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, trend, subtitle, color }: any) {
    const colorStyles: any = {
        blue: 'text-blue-600 bg-blue-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        orange: 'text-orange-600 bg-orange-50',
        purple: 'text-purple-600 bg-purple-50',
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorStyles[color] || 'bg-slate-100'}`}>
                    <Icon size={24} />
                </div>
                {trend && <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
            </div>
        </div>
    );
}

function LegendItem({ color, label, value, bold }: any) {
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-slate-600">{label}</span>
            </div>
            <span className={bold ? "font-bold text-slate-800" : "text-slate-500"}>{value}</span>
        </div>
    );
}
