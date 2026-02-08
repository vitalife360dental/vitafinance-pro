import { useState, useEffect } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, AlertTriangle, TrendingUp, DollarSign, Clock, Settings, RefreshCw, Sliders } from 'lucide-react';
import { financeService } from '../services/financeService';
import { OperationalConfigModal } from '../components/OperationalConfigModal';

export default function Insumos() {
    const [loading, setLoading] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [chairStats, setChairStats] = useState<any[]>([]);
    const [config, setConfig] = useState<any>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Try to fetch analysis
            let { items, config } = await financeService.getSupplyAnalysis();

            // 2. AUTO-HEAL: If we detect 0 costs assigned, try to initialize defaults automatically
            const hasCosts = items.some(i => i.supplyCost > 0);
            if (!hasCosts) {
                console.log("No costs detected. Auto-initializing defaults...");
                await financeService.initializeDefaultCosts();
                // Fetch again
                const retry = await financeService.getSupplyAnalysis();
                items = retry.items;
                config = retry.config;
            }

            // 3. Fetch Raw Transactions for Chair Analysis (since aggregates lose chair info)
            const transactions = await financeService.getTransactions();
            const chairMap: Record<string, { income: number, minutes: number }> = {};

            transactions.forEach((t: any) => {
                const chair = t.chair || 'Sin Asignar';
                if (!chairMap[chair]) chairMap[chair] = { income: 0, minutes: 0 };

                if (t.type === 'income') {
                    chairMap[chair].income += Number(t.amount);
                    // Parse duration "30 min" -> 30
                    const duration = t.duration ? parseInt(t.duration) : 30;
                    chairMap[chair].minutes += duration;
                }
            });

            // Convert to Array
            const chairStatsArray = Object.entries(chairMap).map(([name, stats]) => ({
                name,
                income: stats.income,
                hours: stats.minutes / 60,
                revenuePerHour: stats.minutes > 0 ? (stats.income / (stats.minutes / 60)) : 0
            })).sort((a, b) => b.revenuePerHour - a.revenuePerHour);

            setData(items);
            setConfig(config);
            setChairStats(chairStatsArray);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping Logic
    const groupedItems = filteredItems.reduce((acc: any, item) => {
        const key = item.categoryGroup;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <PageHeader
                    title="Análisis de Rentabilidad Real"
                    subtitle="Control de costos, insumos y gastos operativos por tratamiento."
                />
                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            setLoading(true);
                            await financeService.initializeDefaultCosts();
                            await loadData();
                        }}
                        className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors"
                        title="Recargar costos predeterminados"
                    >
                        <Settings size={18} />
                        <span className="text-sm font-bold">Sincronizar Costos</span>
                    </button>

                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                    >
                        <Sliders size={18} />
                        <span className="text-sm font-bold">Configurar Gastos</span>
                    </button>

                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Costo Operativo (Sillón)</span>
                        <span className="text-lg font-bold text-slate-700">${config.costPerMinute?.toFixed(2)} <span className="text-xs text-slate-400">/ min</span></span>
                    </div>
                </div>
            </div>

            {/* Chair Productivity Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {chairStats.map((chair, index) => (
                    <Card key={chair.name} className="relative overflow-hidden border-slate-200">
                        <div className={`absolute top-0 left-0 w-1 h-full ${index === 0 ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-700">{chair.name}</h3>
                                    <p className="text-xs text-slate-400">{chair.hours.toFixed(1)} horas ocupadas</p>
                                </div>
                                {index === 0 && <Badge variant="warning" className="text-[10px]">👑 Líder</Badge>}
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <div>
                                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Ingreso</span>
                                    <div className="text-xl font-bold text-slate-800">${chair.income.toFixed(2)}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Prod / Hora</span>
                                    <div className={`text-xl font-bold ${chair.revenuePerHour > (config.costPerMinute * 60) ? 'text-emerald-600' : 'text-red-500'}`}>
                                        ${chair.revenuePerHour.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl" noPadding>
                {/* Toolbar */}
                <div className="p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 bg-white">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar tratamiento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-[#5dc0bb]/20 text-slate-600 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tratamiento</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Duración</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Precio</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-red-400 uppercase tracking-wider text-right bg-red-50/10">(-) Coms (33%)</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-amber-500 uppercase tracking-wider text-right bg-amber-50/30">(-) Insumos</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right bg-slate-100/50">(-) Op. Sillón</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-emerald-600 uppercase tracking-wider text-right bg-emerald-50/30 border-l border-emerald-100">(=) Utilidad Real</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Margen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {Object.keys(groupedItems).map(category => (
                                <>
                                    {/* Category Header */}
                                    <tr key={category} className="bg-slate-50 border-b border-slate-200">
                                        <td colSpan={8} className="px-6 py-3">
                                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{category}</span>
                                        </td>
                                    </tr>
                                    {/* Items */}
                                    {groupedItems[category].map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-slate-800">
                                                {item.name}
                                                <div className="text-[10px] text-slate-400 font-normal">{item.category}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="neutral" className="text-xs">{item.finalDuration} min</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-800 bg-white">
                                                ${item.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-red-500 text-xs bg-red-50/10">
                                                -${item.doctor_commission.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium bg-amber-50/30 p-0 relative group-hover:bg-amber-100/30 transition-colors">
                                                <div className="flex items-center justify-end px-6 py-4">
                                                    <span className="text-amber-600 mr-1">-$</span>
                                                    <input
                                                        type="number"
                                                        step="0.10"
                                                        className="w-16 bg-transparent text-right border-b border-dashed border-amber-300 focus:border-amber-600 focus:outline-none text-amber-700 font-bold"
                                                        defaultValue={item.supplyCost.toFixed(2)}
                                                        onBlur={async (e) => {
                                                            const newVal = parseFloat(e.target.value);
                                                            if (!isNaN(newVal) && newVal !== item.supplyCost) {
                                                                await financeService.updateTreatmentCost(item.name, newVal);
                                                                loadData(); // Refresh to recalc totals
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.currentTarget.blur();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500 text-xs bg-slate-100/50">
                                                -${item.overheadCost.toFixed(2)}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold text-sm bg-emerald-50/30 border-l border-emerald-100 ${item.netProfit < 0 ? 'text-red-500' : 'text-emerald-700'}`}>
                                                ${item.netProfit.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge
                                                    variant={item.profitabilityStatus === 'critical' ? 'error' : item.profitabilityStatus === 'warning' ? 'warning' : 'success'}
                                                >
                                                    {item.margin.toFixed(0)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <OperationalConfigModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                currentConfig={config}
                onSave={async (newConfig) => {
                    await financeService.saveClinicConfig(newConfig);
                    await loadData();
                }}
            />
        </PageContainer>
    );
}
