import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    RefreshCw,
    Wallet,
    Target,
    Activity,
    Plus,
    Users,
    ArrowRight,
    MessageCircle, // WhatsApp Icon
    Share2
} from 'lucide-react';
import { financeService } from '../services/financeService';
import { whatsappService } from '../services/whatsappService'; // Import Service
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Grid } from '../components/ui/Grid';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { NewExpenseModal } from '../components/NewExpenseModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            // We use getGoalsAnalytics because it already aggregates everything (Production - Costs = Utility)
            const result = await financeService.getGoalsAnalytics();
            setData(result);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <PageContainer>
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <RefreshCw size={32} className="animate-spin text-teal-600" />
                <p className="text-slate-500">Analizando signos vitales de la clínica...</p>
            </div>
        </PageContainer>
    );

    if (!data) return <div className="p-10 text-center text-red-500">Error al cargar el tablero.</div>;

    const { actual, goals, details } = data;

    // Calculate Top Doctor (Safe)
    const topDoctor = details.doctors && details.doctors.length > 0
        ? details.doctors.sort((a: any, b: any) => b.netContribution - a.netContribution)[0]
        : null;

    return (
        <PageContainer>
            <PageHeader
                title="Centro de Comando 🚁"
                subtitle="Resumen ejecutivo de rendimiento en tiempo real."
            >
                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => setIsExpenseModalOpen(true)}
                    >
                        <Plus size={16} className="mr-2" />
                        Registrar Gasto
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadDashboard}
                    >
                        <RefreshCw size={16} />
                    </Button>
                </div>
            </PageHeader>

            {/* 1. FINANCIAL PULSE (KPIs) */}
            <Grid cols={3} gap={6} className="mb-8">
                {/* Income */}
                <Card className="p-5 flex items-center justify-between border-l-4 border-l-blue-500 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-slate-500 text-sm font-medium mb-1">Ingresos (Facturación)</p>
                        <h3 className="text-2xl font-bold text-slate-900">${actual.billing.month.toLocaleString()}</h3>
                        <div className="flex items-center gap-1 mt-2 text-xs">
                            <Badge variant="blue" className="bg-blue-50 text-blue-700 border-blue-100">
                                Meta: ${goals.BILLING.MONTHLY.toLocaleString()}
                            </Badge>
                            <span className="text-slate-400 text-[10px] ml-1">
                                ({actual.billing.percent.toFixed(0)}%)
                            </span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign size={24} />
                    </div>
                </Card>

                {/* Expenses (Calculated as Income - Net Utility) */}
                <Card className="p-5 flex items-center justify-between border-l-4 border-l-amber-500">
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Egresos Operativos</p>
                        <h3 className="text-2xl font-bold text-slate-900">${actual.expenses?.month.toLocaleString() ?? '0'}</h3>
                        <p className="text-xs text-slate-400 mt-2">
                            Representa el <span className="font-bold text-amber-600">{actual.expenses?.ratio.toFixed(1) ?? '0'}%</span> de ingresos
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Wallet size={24} />
                    </div>
                </Card>

                {/* Net Utility */}
                <Card className="p-5 flex items-center justify-between border-l-4 border-l-emerald-500 bg-emerald-50/30">
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Utilidad Neta Real</p>
                        <h3 className="text-2xl font-bold text-emerald-700">${actual.utility.month.toLocaleString()}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <TrendingUp size={14} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-600">Margen {((actual.utility.month / (actual.billing.month || 1)) * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                        <Target size={24} />
                    </div>
                </Card>
            </Grid>

            <Grid cols={3} gap={6}>

                {/* 2. GOALS WIDGET (Main Focus) */}
                <Card className="md:col-span-2 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Target className="text-teal-600" size={20} />
                            Estado de Metas (Proyección Cierre)
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/metas')}>
                            Ver Detalles <ArrowRight size={16} className="ml-1" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Billing Goal */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 font-medium">Facturación Mensual</span>
                                <span className="text-slate-900 font-bold">
                                    ${actual.billing.projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    <span className="text-slate-400 font-normal ml-1">/ ${goals.BILLING.MONTHLY.toLocaleString()}</span>
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-1000 ${actual.billing.percent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(100, actual.billing.percent)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 text-right">
                                {actual.billing.percent.toFixed(1)}% de cumplimiento
                            </p>
                        </div>

                        {/* Efficiency Gauge (Simple visual for now) */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rentabilidad / Hora</p>
                                <p className="text-2xl font-bold text-slate-800">${actual.efficiency.hourly.toFixed(0)}</p>
                                <p className="text-[10px] text-slate-400">Meta: ${goals.EFFICIENCY.HOURLY_UTILITY}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Doctor Top (Aporte)</p>
                                <p className="text-lg font-bold text-slate-800 truncate">{topDoctor?.name || 'N/A'}</p>
                                <p className="text-[10px] text-emerald-600 font-bold">${topDoctor?.netContribution?.toLocaleString() || '0'}</p>
                            </div>
                        </div>
                    </div>
                </Card>

            </Grid>

            {/* 4. CLINICAL INSIGHTS (New Section) */}
            <h3 className="font-bold text-slate-800 mb-4 mt-8 flex items-center gap-2 text-lg">
                <Activity className="text-teal-600" size={20} />
                Quirófano Operativo
            </h3>

            <Grid cols={3} gap={6} className="mb-10">
                {/* Top Treatments */}
                <Card className="p-6">
                    <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Tratamientos Top (Ingresos)</h4>
                    <div className="space-y-4">
                        {details.treatments?.map((t: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 truncate w-32">{t.name}</p>
                                        <p className="text-[10px] text-slate-400">{t.count} realizados</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">${t.price.toLocaleString()}</p>
                                    <p className="text-[10px] text-emerald-600 font-bold">{t.marginPercent.toFixed(0)}% margen</p>
                                </div>
                            </div>
                        ))}
                        {(!details.treatments || details.treatments.length === 0) && (
                            <p className="text-slate-400 text-sm text-center py-4">Sin datos de tratamientos.</p>
                        )}
                    </div>
                </Card>

                {/* Doctor Performance */}
                <Card className="p-6">
                    <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Efectividad Doctores</h4>
                    <div className="space-y-4">
                        {details.doctors?.slice(0, 5).map((d: any, i: number) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold uppercase">
                                        {d.name.slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{d.name}</p>
                                        <p className="text-[10px] text-slate-400">{d.attentions} atenciones</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={d.goalStatus === 'ok' ? 'success' : 'warning'} className="text-[10px]">
                                        ${d.netContribution.toLocaleString()}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Access Grid (Moved here) */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Accesos Directos</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {/* WhatsApp Button */}
                            <Button
                                variant="outline"
                                className="justify-start h-12 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 mb-2"
                                onClick={() => whatsappService.shareDailyReport(data)}
                            >
                                <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center mr-3">
                                    <MessageCircle size={14} />
                                </div>
                                <span className="text-emerald-900 font-bold">Enviar Reporte por WhatsApp</span>
                            </Button>

                            <Button variant="outline" className="justify-start h-12 border-slate-200 hover:border-teal-300 hover:bg-teal-50" onClick={() => navigate('/ingresos')}>
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                                    <TrendingUp size={14} />
                                </div>
                                <span className="text-slate-700">Ver Facturación</span>
                            </Button>
                            <Button variant="outline" className="justify-start h-12 border-slate-200 hover:border-red-300 hover:bg-red-50" onClick={() => navigate('/egresos')}>
                                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                                    <TrendingDown size={14} />
                                </div>
                                <span className="text-slate-700">Gestionar Gastos</span>
                            </Button>
                            <Button variant="outline" className="justify-start h-12 border-slate-200 hover:border-blue-300 hover:bg-blue-50" onClick={() => navigate('/produccion')}>
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                    <Users size={14} />
                                </div>
                                <span className="text-slate-700">Producción Doctores</span>
                            </Button>

                            {/* WhatsApp Button Moved Up */}
                        </div>
                    </Card>
                    <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-900/20">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-bold text-lg">VitaBot AI 🤖</h4>
                                <p className="text-slate-400 text-xs mt-1">Tu analista financiero personal.</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg animate-pulse">
                                <Activity size={20} className="text-teal-400" />
                            </div>
                        </div>
                        <p className="text-sm mt-4 text-slate-300 italic">
                            "La facturación proyectada para fin de mes se ve sólida. ¿Quieres ver el detalle?"
                        </p>
                    </Card>
                </div>

            </Grid>

            <NewExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSave={async (expenseData: any) => {
                    try {
                        const { error } = await financeService.createTransaction({
                            ...expenseData,
                            type: 'expense'
                        });
                        if (error) throw error;
                        loadDashboard();
                        setIsExpenseModalOpen(false);
                    } catch (e) {
                        console.error(e);
                        alert("Error al guardar");
                    }
                }}
            />
        </PageContainer>
    );
}
