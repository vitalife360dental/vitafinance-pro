import { useState } from 'react';
import { GlassModal } from './GlassModal';
import { Button } from './Button';
import { financeService } from '../../services/financeService';

interface GoalsConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentGoals: any;
    onSave: () => void;
}

export function GoalsConfigModal({ isOpen, onClose, currentGoals, onSave }: GoalsConfigModalProps) {
    const [goals, setGoals] = useState(currentGoals);
    const [loading, setLoading] = useState(false);

    const handleChange = (category: string, metric: string, value: string) => {
        setGoals((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [metric]: Number(value)
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await financeService.updateGoals(goals);
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving goals', error);
        } finally {
            setLoading(false);
        }
    };

    if (!goals) return null;

    return (
        <GlassModal isOpen={isOpen} onClose={onClose} title="Configurar Metas Financieras">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">

                {/* Billing */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        💰 Facturación (Ingresos Brutos)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">Meta Mensual ($)</label>
                            <input
                                type="number"
                                value={goals.BILLING.MONTHLY}
                                onChange={(e) => handleChange('BILLING', 'MONTHLY', e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">Meta Diaria ($)</label>
                            <input
                                type="number"
                                value={goals.BILLING.DAILY}
                                onChange={(e) => handleChange('BILLING', 'DAILY', e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Utility */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                        📈 Utilidad Neta (Ganancia Real)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-emerald-700 block mb-1">Meta Mensual ($)</label>
                            <input
                                type="number"
                                value={goals.NET_UTILITY.MONTHLY}
                                onChange={(e) => handleChange('NET_UTILITY', 'MONTHLY', e.target.value)}
                                className="w-full p-2 border border-emerald-200 rounded-lg text-emerald-900 bg-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-emerald-700 block mb-1">Margen Esperado (%)</label>
                            <input
                                type="number"
                                value={goals.NET_UTILITY.MARGIN_PERCENT}
                                onChange={(e) => handleChange('NET_UTILITY', 'MARGIN_PERCENT', e.target.value)}
                                className="w-full p-2 border border-emerald-200 rounded-lg text-emerald-900 bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Operational */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm">💺 Sillones</h3>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Meta Diaria por Sillón ($)</label>
                        <input
                            type="number"
                            value={goals.CHAIR.DAILY_REVENUE}
                            onChange={(e) => handleChange('CHAIR', 'DAILY_REVENUE', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm">👨‍⚕️ Doctores</h3>
                        <label className="text-xs font-medium text-slate-500 block mb-1">Aporte Neto Mínimo ($)</label>
                        <input
                            type="number"
                            value={goals.DOCTOR.MIN_NET_CONTRIBUTION}
                            onChange={(e) => handleChange('DOCTOR', 'MIN_NET_CONTRIBUTION', e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                </div>

            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Objetivos'}
                </Button>
            </div>
        </GlassModal>
    );
}
