import { useState, useEffect } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { financeService } from '../services/financeService';
import { PageLayout } from '../components/ui/PageLayout';
import { Grid } from '../components/ui/Grid';
import { SectionCard } from '../components/ui/SectionCard';

export default function Metas() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGoals = async () => {
            try {
                const data = await financeService.getDashboardMetrics();
                setMetrics(data);
            } catch (error) {
                console.error('Error loading goals:', error);
            } finally {
                setLoading(false);
            }
        };
        loadGoals();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando tablero de metas...</div>;

    // Define Dynamic Goals based on Real Data
    const currentGoals = [
        {
            id: 1,
            title: 'Facturación Mensual',
            current: metrics?.month?.income || 0,
            target: 15000,
            unit: '$',
            period: 'Marzo 2024'
        },
        {
            id: 2,
            title: 'Pacientes Atendidos',
            current: metrics?.month?.appointments || 0,
            target: 100,
            unit: 'pacientes',
            period: 'Marzo 2024'
        },
        {
            id: 3,
            title: 'Control de Gastos',
            current: metrics?.month?.expense || 0,
            target: 5000,
            unit: '$',
            period: 'Marzo 2024',
            inverse: true // Lower is better
        },
        {
            id: 4,
            title: 'Rentabilidad Neta',
            current: (metrics?.month?.income || 0) - (metrics?.month?.expense || 0),
            target: 10000,
            unit: '$',
            period: 'Marzo 2024'
        }
    ];

    return (
        <PageLayout
            title="Metas y Objetivos 🎯"
            subtitle="Establece y monitorea los objetivos financieros de tu clínica."
        >
            {/* Goals Grid */}
            <Grid cols={2} gap={6}>
                {currentGoals.map((goal: any) => {
                    const progress = Math.round((goal.current / goal.target) * 100);
                    // Logic for "good" depends on inverse flag (expense vs income)
                    const isGood = goal.inverse
                        ? progress <= 100 // Expenses: Good if under 100% of budget
                        : progress >= 70; // Income: Good if over 70% of target

                    const statusText = goal.inverse
                        ? (progress > 100 ? 'Excedido' : 'En Rango')
                        : (progress >= 100 ? '¡Logrado!' : progress >= 70 ? 'En camino' : 'Atrasado');

                    const statusColor = goal.inverse
                        ? (progress > 100 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50')
                        : (progress >= 70 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50');

                    const barColor = goal.inverse
                        ? (progress > 100 ? 'bg-red-500' : 'bg-emerald-500')
                        : (progress >= 70 ? 'bg-emerald-500' : 'bg-amber-500');

                    return (
                        <div key={goal.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <Target size={22} />
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
                                    {statusText}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg mb-1">{goal.title}</h3>
                            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{goal.period}</span>

                            <div className="mt-5 space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold text-slate-800">
                                        {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : `${goal.current} ${goal.unit}`}
                                    </span>
                                    <span className="text-sm font-semibold text-blue-600">{progress}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-400 font-medium">
                                        Meta: {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : `${goal.target} ${goal.unit}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Grid>

            {/* Tips Section */}
            <SectionCard>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Consejo del día</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {metrics?.month?.income > 2000
                                ? "¡Excelente ritmo de facturación este mes! Considera reinvertir un 10% en publicidad para mantener el flujo de pacientes nuevos."
                                : "Para alcanzar tu meta de ingresos, intenta contactar a 5 pacientes inactivos hoy para agendar revisiones."}
                        </p>
                    </div>
                </div>
            </SectionCard>
        </PageLayout>
    );
}
