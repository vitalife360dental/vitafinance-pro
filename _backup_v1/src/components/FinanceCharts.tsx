import React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface Transaction {
    id: number | string;
    amount: number;
    date: string; // YYYY-MM-DD
    type: 'income' | 'expense';
    category_name?: string;
    treatment_name?: string;
}

interface FinanceChartsProps {
    transactions: Transaction[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

export const IncomeExpenseChart = ({ transactions }: FinanceChartsProps) => {
    const data = useMemo(() => {
        // Group by date
        const grouped = transactions.reduce((acc, curr) => {
            const date = curr.date;
            if (!acc[date]) {
                acc[date] = { date, income: 0, expense: 0 };
            }
            if (curr.type === 'income') {
                acc[date].income += Number(curr.amount);
            } else {
                acc[date].expense += Number(curr.amount);
            }
            return acc;
        }, {} as Record<string, { date: string, income: number, expense: number }>);

        // Convert to array and sort by date
        return Object.values(grouped)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            // Take the last 15 days of activity for better visibility, or all if less
            // You can adjust this slice as needed
            .slice(-15);
    }, [transactions]);

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[350px] flex items-center justify-center text-slate-400">
                No hay datos suficientes para mostrar el gráfico
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[350px]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Tendencia de Ingresos vs Egresos</h3>
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(str) => {
                            const d = new Date(str);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: any, name: any) => [
                            `$${Number(value).toFixed(2)}`,
                            name === 'income' ? 'Ingresos' : 'Egresos'
                        ]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area
                        type="monotone"
                        dataKey="income"
                        name="Ingresos"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        strokeWidth={3}
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        name="Egresos"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ExpenseCategoryChart = ({ transactions }: FinanceChartsProps) => {
    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const grouped = expenses.reduce((acc, curr) => {
            const category = curr.category_name || curr.treatment_name || 'Otros';
            acc[category] = (acc[category] || 0) + Number(curr.amount);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6 categories
    }, [transactions]);

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[350px] flex items-center justify-center text-slate-400">
                No hay egresos registrados
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[350px]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Distribución de Gastos</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
