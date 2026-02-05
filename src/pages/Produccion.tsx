import { useState, useEffect } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { LayoutDashboard, Armchair, Users, Activity, FileText, AlertTriangle } from 'lucide-react';
import ProductionResume from '../components/production/ProductionResume';
import ProductionChairs from '../components/production/ProductionChairs';
import ProductionDoctors from '../components/production/ProductionDoctors';
import ProductionTreatments from '../components/production/ProductionTreatments';
import ProductionAranceles from '../components/production/ProductionAranceles';
import ProductionAlerts from '../components/production/ProductionAlerts';
import { financeService } from '../services/financeService';

export default function Produccion() {
    const [activeTab, setActiveTab] = useState('resumen');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const analytics = await financeService.getProductionAnalytics();
                setData(analytics);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const tabs = [
        { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
        { id: 'sillones', label: 'Sillones', icon: Armchair },
        { id: 'doctores', label: 'Doctores', icon: Users },
        { id: 'tratamientos', label: 'Tratamientos', icon: Activity },
        { id: 'aranceles', label: 'Aranceles', icon: FileText },
        { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
    ];

    return (
        <PageContainer>
            <div className="space-y-6">
                <PageHeader
                    title="Producción y Rentabilidad"
                    subtitle="Análisis financiero avanzado del consultorio"
                >
                    <button
                        onClick={() => { }}
                        className="bg-white border text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl font-medium shadow-sm active:scale-95 transition-all text-sm"
                    >
                        Exportar Reporte
                    </button>
                </PageHeader>

                {/* Navigation Tabs */}
                <div className="flex overflow-x-auto gap-2 p-1 bg-slate-100 rounded-xl">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-[#5dc0bb] shadow-sm'
                                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl shadow-sm min-h-[400px] border border-slate-200">
                    {loading ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5dc0bb]"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'resumen' && <ProductionResume data={data} />}
                            {activeTab === 'sillones' && <ProductionChairs data={data} />}
                            {activeTab === 'doctores' && <ProductionDoctors data={data} />}
                            {activeTab === 'tratamientos' && <ProductionTreatments data={data} />}
                            {activeTab === 'aranceles' && <ProductionAranceles data={data} />}
                            {activeTab === 'alertas' && <ProductionAlerts data={data} />}
                        </>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
