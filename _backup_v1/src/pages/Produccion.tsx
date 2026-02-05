import { useState, useEffect } from 'react';
import { TrendingUp, Award, DollarSign } from 'lucide-react';
import { financeService } from '../services/financeService';
import { PageLayout } from '../components/ui/PageLayout';
import { Grid } from '../components/ui/Grid';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionCard } from '../components/ui/SectionCard';
import { mockTreatments } from '../data/mockData';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    category: string;
    type: 'income' | 'expense';
    doctor_name?: string;
}

export default function Produccion() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await financeService.getTransactions();
            // data is already Transaction[] with 'type' field normalized
            const allTransactions = data.map((t: any) => ({
                id: String(t.id),
                amount: Number(t.amount),
                description: t.concept || t.description,
                date: t.date,
                category: t.category_name || t.category || 'General',
                type: t.type,
                doctor_name: t.doctor_name
            }));
            setTransactions(allTransactions);
        } catch (error) {
            console.error('Error loading production data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate production metrics
    const totalProduction = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const doctorProduction = transactions
        .filter(t => t.type === 'income' && t.doctor_name)
        .reduce((acc, t) => {
            const doc = t.doctor_name || 'Desconocido';
            acc[doc] = (acc[doc] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const chartData = Object.entries(doctorProduction).map(([name, amount]) => ({
        name,
        amount
    })).sort((a, b) => b.amount - a.amount);

    const topDoctor = chartData.length > 0 ? chartData[0] : { name: '-', amount: 0 };

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando producción...</div>;

    return (
        <PageLayout
            title="Producción 📊"
            subtitle="Análisis de rendimiento y productividad de la clínica."
        >
            {/* KPI Grid */}
            <Grid cols={3} gap={6}>
                <KpiCard
                    title="Producción Total"
                    value={`$${totalProduction.toLocaleString()}`}
                    icon={DollarSign}
                    color="blue"
                />
                <KpiCard
                    title="Top Doctor"
                    value={topDoctor.name}
                    icon={Award}
                    color="amber"
                />
                <KpiCard
                    title="Tratamientos"
                    value={mockTreatments.length}
                    icon={TrendingUp}
                    color="green"
                />
            </Grid>

            {/* Main Content Grid */}
            <Grid cols={2} gap={8}>
                {/* Doctor Performance Chart */}
                <SectionCard
                    title="Rendimiento por Doctor"
                    className="h-96"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </SectionCard>

                {/* Top Treatments List */}
                <SectionCard title="Tratamientos Más Rentables">
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {mockTreatments.map((treatment, index) => (
                            <div key={treatment.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shadow-sm">
                                        {index + 1}
                                    </div>
                                    <span className="font-medium text-slate-700 text-sm">{treatment.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-800 text-sm">${treatment.revenue.toLocaleString()}</span>
                                    <span className="text-xs text-slate-400">{treatment.count} realizados</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </Grid>
        </PageLayout>
    );
}
