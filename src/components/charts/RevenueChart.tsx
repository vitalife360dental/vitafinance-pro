import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';

interface RevenueChartProps {
    data: {
        month: string;
        income: number;
        expenses: number;
    }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Tendencia Financiera</h3>
                    <p className="text-sm text-slate-500">Comportamiento de Ingresos vs. Gastos (Últimos 6 meses)</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-600 font-medium">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-slate-600 font-medium">Gastos</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => `$${value >= 1000 ? `${value / 1000}k` : value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                            itemStyle={{ color: '#1e293b', fontSize: '13px', fontWeight: 600 }}
                            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="income"
                            name="Ingresos"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorIncome)"
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            name="Gastos"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorExpense)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
