import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Users, ArrowUpRight, ArrowDownRight, Clock, RefreshCw } from 'lucide-react';
import { financeService } from '../services/financeService';
import { mockGoals, mockTreatments } from '../data/mockData';
import { PageContainer } from '../components/ui/PageContainer';
import { Grid } from '../components/ui/Grid';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionCard } from '../components/ui/SectionCard';
import { PageHeader } from '../components/ui/PageHeader';

export default function Inicio() {
    const [metrics, setMetrics] = useState({
        today: { income: 0, expense: 0, net: 0, appointments: 0 },
        total: { income: 0, expense: 0, balance: 0 }
    });
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const data = await financeService.getDashboardMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Error loading dashboard metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const RefreshButton = (
        <button
            onClick={loadDashboardData}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Actualizar datos"
        >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
    );

    return (
        <PageContainer>
            <PageHeader
                title="Hello, Dra. Ana! 👋"
                subtitle="Aquí tienes lo que está pasando en tu clínica hoy."
            >
                <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm text-sm font-medium text-slate-600">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Este mes</span>
                </div>
                {RefreshButton}
            </PageHeader>

            {/* KPI Cards Grid (Reference Style - Mixed) */}
            <Grid cols={4} gap={10}>
                {/* Primary Card (Blue Gradient) */}
                <KpiCard
                    title="Ingresos Totales"
                    value={`$${metrics.today.income.toLocaleString()}`}
                    icon={DollarSign}
                    variant="primary"
                    trend={{ value: '+2.4%', direction: 'up' }}
                />

                {/* Secondary Cards (White/Clean) */}
                <KpiCard
                    title="Citas Agendadas"
                    value={metrics.today.appointments}
                    icon={Calendar}
                    color="violet"
                />
                <KpiCard
                    title="Gastos Operativos"
                    value={`$${metrics.today.expense.toLocaleString()}`}
                    icon={Clock}
                    color="amber"
                />
                <KpiCard
                    title="Balance Neto"
                    value={`$${metrics.today.net.toLocaleString()}`}
                    icon={TrendingUp}
                    color="green"
                    trend={{ value: '+5.6%', direction: 'up' }}
                />
            </Grid>

            {/* Main Content Grid (Two Columns) */}
            <Grid cols={2} gap={12} className="mt-12">

                {/* Goals Section */}
                <SectionCard
                    title="Metas del Mes"
                    icon={<TrendingUp size={20} />}
                >
                    <div className="space-y-6">
                        {mockGoals.map((goal) => {
                            const progress = Math.round((goal.current / goal.target) * 100);
                            return (
                                <div key={goal.id} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-slate-700">{goal.title}</span>
                                        <span className="text-blue-600">{progress}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>{goal.unit === '$' ? `$${goal.current.toLocaleString()}` : `${goal.current} ${goal.unit}`}</span>
                                        <span>Meta: {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : `${goal.target} ${goal.unit}`}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>

                {/* Top Treatments Section */}
                <SectionCard
                    title="Tratamientos Top"
                    icon={<DollarSign size={20} />}
                >
                    <div className="space-y-4">
                        {mockTreatments.slice(0, 5).map((treatment, index) => (
                            <div key={treatment.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-800 text-sm">{treatment.name}</h4>
                                        <p className="text-xs text-slate-500">{treatment.count} realizados</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-800 text-sm">${treatment.revenue.toLocaleString()}</span>
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium 
                                        ${treatment.trend === 'up' ? 'text-green-600' :
                                            treatment.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                                        {treatment.trend === 'up' && <ArrowUpRight size={12} />}
                                        {treatment.trend === 'down' && <ArrowDownRight size={12} />}
                                        {treatment.trend === 'up' ? '8%' : treatment.trend === 'down' ? '3%' : '0%'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

            </Grid>
        </PageContainer>
    );
}
