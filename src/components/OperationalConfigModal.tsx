import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Clock } from 'lucide-react';

interface OperationalConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentConfig: any;
    onSave: (config: any) => Promise<void>;
}

export const OperationalConfigModal: React.FC<OperationalConfigModalProps> = ({ isOpen, onClose, currentConfig, onSave }) => {
    const [formData, setFormData] = useState({
        OPERATIONAL_HOURS_MONTHLY: 160,
        COST_RENT: 0,
        COST_ELECTRICITY: 0,
        COST_WATER: 0,
        COST_INTERNET: 0,
        COST_SALARIES: 0,
        COST_OTHER: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentConfig) {
            setFormData({
                OPERATIONAL_HOURS_MONTHLY: currentConfig.OPERATIONAL_HOURS_MONTHLY || 160,
                COST_RENT: currentConfig.COST_RENT || 0,
                COST_ELECTRICITY: currentConfig.COST_ELECTRICITY || 0,
                COST_WATER: currentConfig.COST_WATER || 0,
                COST_INTERNET: currentConfig.COST_INTERNET || 0,
                COST_SALARIES: currentConfig.COST_SALARIES || 0,
                COST_OTHER: currentConfig.COST_OTHER || 0
            });
        }
    }, [isOpen, currentConfig]);

    const calculateTotal = () => {
        return (
            (Number(formData.COST_RENT) || 0) +
            (Number(formData.COST_ELECTRICITY) || 0) +
            (Number(formData.COST_WATER) || 0) +
            (Number(formData.COST_INTERNET) || 0) +
            (Number(formData.COST_SALARIES) || 0) +
            (Number(formData.COST_OTHER) || 0)
        );
    };

    const totalFixed = calculateTotal();
    const costPerMinute = formData.OPERATIONAL_HOURS_MONTHLY > 0
        ? totalFixed / (formData.OPERATIONAL_HOURS_MONTHLY * 60)
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // We also save the calculated total as FIXED_COSTS_MONTHLY for backward compatibility
        await onSave({
            ...formData,
            FIXED_COSTS_MONTHLY: totalFixed
        });
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Costo Operativo del Consultorio</h3>
                        <p className="text-xs text-slate-500">Define tus gastos fijos mensuales para calcular el "Costo Sillón"</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Horas Operativas */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">
                            Horas Laborables al Mes
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 text-blue-400" size={16} />
                            <input
                                type="number"
                                required
                                value={formData.OPERATIONAL_HOURS_MONTHLY}
                                onChange={(e) => setFormData({ ...formData, OPERATIONAL_HOURS_MONTHLY: Number(e.target.value) })}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 text-blue-900 font-bold bg-white"
                            />
                        </div>
                        <p className="text-[10px] text-blue-500 mt-1">
                            Ej: 160 horas (40h semana x 4 semanas)
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Alquiler ($)</label>
                            <input type="number" step="0.01" className="input-field w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.COST_RENT} onChange={e => setFormData({ ...formData, COST_RENT: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Sueldos Fijos ($)</label>
                            <input type="number" step="0.01" className="input-field w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.COST_SALARIES} onChange={e => setFormData({ ...formData, COST_SALARIES: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Electricidad ($)</label>
                            <input type="number" step="0.01" className="input-field w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.COST_ELECTRICITY} onChange={e => setFormData({ ...formData, COST_ELECTRICITY: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Agua ($)</label>
                            <input type="number" step="0.01" className="input-field w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.COST_WATER} onChange={e => setFormData({ ...formData, COST_WATER: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Internet/Tel ($)</label>
                            <input type="number" step="0.01" className="input-field w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.COST_INTERNET} onChange={e => setFormData({ ...formData, COST_INTERNET: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Otros ($)</label>
                            <input type="number" step="0.01" className="input-field w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                value={formData.COST_OTHER} onChange={e => setFormData({ ...formData, COST_OTHER: Number(e.target.value) })} />
                        </div>
                    </div>

                    {/* Resumen en tiempo real */}
                    <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-600">Total Gastos Fijos:</span>
                            <span className="text-base font-bold text-slate-800">${totalFixed.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-emerald-600">Costo por Minuto:</span>
                            <span className="text-xl font-black text-emerald-600">${costPerMinute.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
                    >
                        {loading ? 'Guardando...' : <><Save size={18} /> Guardar Configuración</>}
                    </button>
                </form>
            </div>
        </div>
    );
};
