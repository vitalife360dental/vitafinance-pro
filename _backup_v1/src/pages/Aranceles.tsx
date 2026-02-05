import React from 'react';
import { FileText, Plus, AlertCircle } from 'lucide-react';
import { financeService } from '../services/financeService';

const Aranceles = () => {
    const [aranceles, setAranceles] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await financeService.getAranceles();
            setAranceles(data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            // Don't show critical error, just hint to creating table
            setError('No se pudo cargar la lista. Asegúrate de crear la tabla "vf_aranceles".');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inicio-page-content">
            {/* Header */}
            <div className="page-header mb-8">
                <div className="header-left">
                    <h1 className="page-title">
                        Aranceles y Comisiones <span className="title-emoji">💰</span>
                    </h1>
                    <p className="page-subtitle">Gestión de precios y comisiones médicas.</p>
                </div>
                <div className="header-actions">
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all">
                        <Plus size={18} />
                        <span>Nuevo Tratamiento</span>
                    </button>
                </div>
            </div>

            {/* ERROR / SETUP HINT */}
            {aranceles.length === 0 && !loading && (
                <div className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 mb-1">Acceso Restringido - DentalFlow</h4>
                        <p className="text-sm text-amber-700 mb-2">
                            Detectamos la tabla de tratamientos pero no tenemos permiso para leerla.
                        </p>
                        <p className="text-xs text-amber-600 bg-amber-100 p-2 rounded border border-amber-200 font-mono">
                            Ejecuta el script <b>enable_treatments_access.sql</b> en Supabase para desbloquear.
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content - Professional Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={20} className="text-slate-400" />
                        Listado de Tratamientos
                    </h2>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold border border-slate-100">
                            {aranceles.length} items
                        </span>
                    </div>
                </div>

                <div className="detailed-table-container border-0 shadow-none rounded-none">
                    <table className="detailed-table w-full">
                        <thead>
                            <tr>
                                <th className="text-left pl-8">TRATAMIENTO</th>
                                <th className="text-right">PRECIO LISTA</th>
                                <th className="text-right">COMISIÓN %</th>
                                <th className="text-right pr-8">PAGO AL DR.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-20 text-slate-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                                        Cargando precios...
                                    </td>
                                </tr>
                            ) : aranceles.length > 0 ? (
                                aranceles.map((row: any, i) => {
                                    const price = Number(row.price || 0);
                                    const doctorPayment = price * 0.33;

                                    return (
                                        <tr key={row.id || i} className="hover:bg-slate-50 transition-colors">
                                            <td className="pl-8 py-5">
                                                <div className="font-medium text-slate-800 text-sm">
                                                    {row.name}
                                                </div>
                                            </td>
                                            <td className="text-right py-5 font-mono text-slate-600 text-sm">
                                                ${price.toFixed(2)}
                                            </td>
                                            <td className="text-right py-5">
                                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold border border-blue-100">
                                                    33% FIJO
                                                </span>
                                            </td>
                                            <td className="text-right pr-8 py-5">
                                                <div className="font-bold text-emerald-600 text-sm">
                                                    ${doctorPayment.toFixed(2)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-24 text-slate-400">
                                        No hay tratamientos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Aranceles;
