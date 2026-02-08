import { useState, useEffect } from 'react';
import { financeService } from '../services/financeService';
import {
    AlertTriangle,
    ShieldCheck,
    ShieldAlert,
    Search,
    PieChart,
    Banknote
} from 'lucide-react';

// ----------------------------------------------------------------------
// INLINE COMPONENTS (Safe Mode)
// ----------------------------------------------------------------------

function LocalPageContainer({ children }: { children: any }) {
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {children}
        </div>
    );
}

function LocalPageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: any }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-14">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-slate-500 font-medium mt-2">{subtitle}</p>
                )}
            </div>

            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}

function LocalCard({ children, className = '' }: { children: any; className?: string }) {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

// ----------------------------------------------------------------------

export default function SRI() {
    const [loading, setLoading] = useState(true);
    const [audit, setAudit] = useState<any>(null);

    useEffect(() => {
        console.log("SRI Component MOUNTED 🚀");
        loadAuditorData();
    }, []);

    const loadAuditorData = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const data = await financeService.getTaxAuditorAnalytics();
            setAudit(data);
        } catch (error) {
            console.error("Audit failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !audit) return (
        <LocalPageContainer>
            <div className="flex items-center justify-center h-64">
                <p className="text-slate-500 animate-pulse">Cargando análisis tributario...</p>
            </div>
        </LocalPageContainer>
    );

    const { summary, alerts } = audit;

    return (
        <LocalPageContainer>
            <LocalPageHeader
                title="Auditoría Tributaria (SRI) 🛡️"
                subtitle="Monitoreo de riesgos fiscales, facturación y deducibilidad."
            >
                <button
                    onClick={loadAuditorData}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    Actualizar Análisis
                </button>
            </LocalPageHeader>

            {/* 1. RISK SCOREBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Risk Level */}
                <LocalCard className={`p-5 border-l-4 ${summary.riskLevel === 'Alto' ? 'border-l-red-500 bg-red-50/50' : summary.riskLevel === 'Medio' ? 'border-l-amber-500 bg-amber-50/50' : 'border-l-emerald-500 bg-emerald-50/50'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Nivel de Riesgo SRI</p>
                            <h3 className={`text-2xl font-bold ${summary.riskLevel === 'Alto' ? 'text-red-700' : 'text-emerald-700'}`}>
                                {summary.riskLevel.toUpperCase()}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2">Basado en brecha de facturación</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            {summary.riskLevel === 'Alto' ? <ShieldAlert size={24} className="text-red-500" /> : <ShieldCheck size={24} className="text-emerald-500" />}
                        </div>
                    </div>
                </LocalCard>

                {/* Taxable Base */}
                <LocalCard className="p-5 border-l-4 border-l-blue-600">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Base Imponible (Est.)</p>
                        <h3 className="text-2xl font-bold text-slate-900">${summary.taxableBase.toLocaleString()}</h3>
                        <p className="text-xs text-slate-400 mt-2">
                            Ingresos (${summary.totalProduction.toLocaleString()}) - Deducibles (${summary.deductibleExpenses.toLocaleString()})
                        </p>
                    </div>
                </LocalCard>

                {/* Estimated Tax */}
                <LocalCard className="p-5 border-l-4 border-l-slate-800 bg-slate-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Impuesto a la Renta</p>
                            <h3 className="text-2xl font-bold text-slate-800">${summary.estimatedRenta.toLocaleString()}</h3>
                            <p className="text-xs text-slate-400 mt-2">Proyección Anual (~20%)</p>
                        </div>
                        <div className="p-2 bg-slate-200 rounded-lg">
                            <Banknote size={20} className="text-slate-600" />
                        </div>
                    </div>
                </LocalCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                {/* 2. INCOME AUDIT (CRITICAL) */}
                <LocalCard className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <Search className="text-blue-600" size={20} />
                        <h3 className="font-bold text-slate-800">Auditoría de Ingresos (Facturación)</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="relative pt-2">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-700">Producción Real (Clínica)</span>
                                <span className="text-sm font-bold text-slate-900">${summary.totalProduction.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-400 w-full" />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-blue-600">Respaldado con Factura</span>
                                <span className="text-sm font-bold text-blue-700">${summary.totalInvoiced.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-blue-100 h-4 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-1000"
                                    style={{ width: `${(summary.totalInvoiced / (summary.totalProduction || 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-amber-800">Brecha Detectada (Sin Factura)</span>
                                <span className="text-lg font-bold text-amber-700">${summary.subInvoicingGap.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-amber-600 mt-2 text-justify">
                                ⚠️ El SRI podría presumir estos ingresos no facturados. Asegúrate de emitir comprobantes para todos los tratamientos terminados.
                            </p>
                        </div>
                    </div>
                </LocalCard>

                {/* 3. EXPENSE AUDIT */}
                <LocalCard className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <PieChart className="text-emerald-600" size={20} />
                        <h3 className="font-bold text-slate-800">Calidad del Gasto</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                            <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Deducibles (Útiles)</p>
                            <p className="text-xl font-bold text-emerald-800">${summary.deductibleExpenses.toLocaleString()}</p>
                            <p className="text-xs text-emerald-500 mt-1">Aranceles, Insumos, Alquiler</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">No Deducibles</p>
                            <p className="text-xl font-bold text-slate-700">${summary.nonDeductibleExpenses.toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-1">Personales, Sin Categoría</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas de Auditoría</h4>
                        {alerts.length > 0 ? (
                            alerts.map((alert: any, i: number) => (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.level === 'critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <AlertTriangle size={16} className={`mt-0.5 ${alert.level === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                                    <div>
                                        <p className={`text-sm font-bold ${alert.level === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>{alert.title}</p>
                                        <p className={`text-xs ${alert.level === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>{alert.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                                <ShieldCheck size={18} />
                                <span className="text-sm font-medium">Todo parece en orden.</span>
                            </div>
                        )}
                    </div>
                </LocalCard>

            </div>
        </LocalPageContainer>
    );
}
