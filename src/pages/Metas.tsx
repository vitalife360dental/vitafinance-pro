import { useState, useEffect } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { GoalsConfigModal } from '../components/ui/GoalsConfigModal';
import { financeService } from '../services/financeService';
import {
    Activity,
    AlertTriangle,
    DollarSign,
    CalendarClock,
    Settings,
    TrendingUp,
    Armchair,
    User,
    Percent
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Metas() {
    const { role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await financeService.getGoalsAnalytics();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando Metas y Proyecciones...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Error al cargar datos.</div>;

    const { goals, actual, details, alerts } = data;

    // Helper for Progress Bar
    const ProgressBar = ({ current, target, color = "bg-blue-500" }: { current: number, target: number, color?: string }) => {
        const percent = Math.min(100, Math.max(0, (current / target) * 100));
        return (
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2">
                <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
            </div>
        );
    };

    return (
        <PageContainer>
            <PageHeader
                title="Metas Financieras y Operativas"
                subtitle="Tablero de control estratégico: Rentabilidad, Cumplimiento y Proyecciones."
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <CalendarClock size={16} />
                        <span className="hidden sm:inline">Proyección al Cierre</span>
                    </div>

                    {(role === 'admin' || role === 'super_admin') && (
                        <Button variant="outline" size="sm" onClick={() => setIsConfigOpen(true)}>
                            <Settings size={16} className="mr-2" />
                            Configurar
                        </Button>
                    )}
                </div>
            </PageHeader>

            <GoalsConfigModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                currentGoals={goals}
                onSave={loadData}
            />

            {/* 1. ALERTS SECTION 🚨 */}
            {alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {alerts.map((alert: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${alert.type === 'critical' ? 'bg-red-50 border-red-100 text-red-800' :
                            alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                'bg-blue-50 border-blue-100 text-blue-800'
                            }`}>
                            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm">{alert.title}</h4>
                                <p className="text-xs opacity-90 mt-1">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. MAIN GOALS: Billing & Utility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Billing Goal */}
                <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Facturación</h3>
                                <p className="text-xs text-slate-500">Meta Mensual: ${goals.BILLING.MONTHLY.toLocaleString()}</p>
                            </div>
                        </div>
                        <Badge variant={actual.billing.percent >= 90 ? 'success' : actual.billing.percent >= 70 ? 'warning' : 'error'}>
                            {actual.billing.percent.toFixed(1)}%
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-slate-600">Actual (Hoy)</span>
                                <span className="text-slate-900">${actual.billing.month.toLocaleString()}</span>
                            </div>
                            <ProgressBar current={actual.billing.month} target={goals.BILLING.MONTHLY} color="bg-blue-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-slate-600">Proyección (Cierre)</span>
                                <span className={`font-bold ${actual.billing.projected >= goals.BILLING.MONTHLY ? 'text-emerald-600' : 'text-red-500'}`}>
                                    ${actual.billing.projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <ProgressBar current={actual.billing.projected} target={goals.BILLING.MONTHLY} color={actual.billing.projected >= goals.BILLING.MONTHLY ? "bg-emerald-500" : "bg-slate-300"} />
                        </div>

                        <p className="text-xs text-slate-500 mt-2 italic">
                            {actual.billing.gap > 0
                                ? "¡Vas superando la meta!"
                                : `Te faltan $${Math.abs(actual.billing.gap).toLocaleString(undefined, { maximumFractionDigits: 0 })} para cumplir el objetivo.`}
                        </p>
                    </div>
                </Card>

                {/* Net Utility Goal */}
                <Card className="p-6 border-l-4 border-l-emerald-400">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Utilidad Neta</h3>
                                <p className="text-xs text-slate-500">Meta: ${goals.NET_UTILITY.MONTHLY.toLocaleString()}</p>
                            </div>
                        </div>
                        <Badge variant={actual.utility.percent >= 90 ? 'success' : 'error'}>
                            {actual.utility.percent.toFixed(1)}%
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-slate-600">Utilidad Real</span>
                                <span className="text-slate-900">${actual.utility.month.toLocaleString()}</span>
                            </div>
                            <ProgressBar current={actual.utility.month} target={goals.NET_UTILITY.MONTHLY} color="bg-emerald-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-slate-600">Proyección Utilidad</span>
                                <span className={`font-bold ${actual.utility.projected >= goals.NET_UTILITY.MONTHLY ? 'text-emerald-600' : 'text-red-500'}`}>
                                    ${actual.utility.projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            {/* No progress bar needed here, number is key */}
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-500">Margen Neto Actual</span>
                                <span className="text-sm font-bold text-emerald-700">
                                    {((actual.utility.month / (actual.billing.month || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Objetivo: {goals.NET_UTILITY.MARGIN_PERCENT}%</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 3. COL: Chairs & Efficiency */}
                <div className="space-y-6">
                    <Card className="p-5">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Armchair size={18} className="text-slate-400" />
                            Metas por Sillón
                        </h3>
                        <div className="space-y-4">
                            {details.chairs.map((chair: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{chair.name}</p>
                                        <p className="text-xs text-slate-500">Promedio Diario: ${(chair.billing / Math.max(1, (new Date().getDate()))).toFixed(0)}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={chair.goalStatus === 'ok' ? 'success' : 'error'}>
                                            {chair.goalStatus === 'ok' ? 'Cumple' : 'Bajo'}
                                        </Badge>
                                        <p className="text-[10px] text-slate-400 mt-1">Meta: ${goals.CHAIR.DAILY_REVENUE}/día</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-slate-400" />
                            Eficiencia
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Utilidad / Hora</p>
                                <p className="text-xl font-bold text-slate-800">${actual.efficiency.hourly.toFixed(0)}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Meta: ${goals.EFFICIENCY.HOURLY_UTILITY}</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Cancelaciones</p>
                                <p className={`text-xl font-bold ${actual.efficiency.cancellationRate > goals.EFFICIENCY.CANCELATION_MAX ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {actual.efficiency.cancellationRate}%
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">Máx: {goals.EFFICIENCY.CANCELATION_MAX}%</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 4. COL: Doctors */}
                <Card className="p-5 lg:col-span-2">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <User size={18} className="text-slate-400" />
                        Metas por Doctor (Aporte Neto)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Doctor</th>
                                    <th className="px-4 py-3">Prod. Total</th>
                                    <th className="px-4 py-3 text-center">Aporte Neto</th>
                                    <th className="px-4 py-3 rounded-r-lg text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {details.doctors.map((doc: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{doc.name}</td>
                                        <td className="px-4 py-3 text-slate-500">${doc.billing.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center font-bold text-emerald-600">${doc.netContribution.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={doc.goalStatus === 'ok' ? 'success' : 'warning'}>
                                                {doc.goalStatus === 'ok' ? 'Cumple' : 'Revisar'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-xs text-blue-800">
                        <Percent size={16} />
                        <p>
                            <strong>Criterio Gerencial:</strong> El "Aporte Neto" es lo que realmente le queda a la clínica después de pagarle al doctor.
                            Doctores que facturan mucho pero dejan poco margen pueden ser menos rentables que doctores con facturación media y alto margen.
                        </p>
                    </div>
                </Card>

            </div>

        </PageContainer>
    );
}
