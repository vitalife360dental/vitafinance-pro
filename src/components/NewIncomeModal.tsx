import { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, Activity, ChevronDown } from 'lucide-react';
import { GlassModal } from './ui/GlassModal';

const SelectInput = ({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[]
}) => (
    <div className="form-group">
        <label className="form-label">
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="form-select"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
        </div>
    </div>
);

export default function NewIncomeModal({ isOpen, onClose, onSave }: any) {
    const [formData, setFormData] = useState({
        patient_name: '',
        treatment_name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Efectivo',
        status: 'PAGADO'
    });

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setFormData({
                patient_name: '',
                treatment_name: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                method: 'Efectivo',
                status: 'PAGADO'
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    return (
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            title="REGISTRAR NUEVO INGRESO"
        >
            <div className="space-y-6">

                {/* Manual Form */}
                <div className="space-y-5">

                    <div className="form-group">
                        <label className="form-label text-xs font-bold text-slate-500 mb-1 block">PACIENTE</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Nombre del Paciente"
                                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-[#5dc0bb]/20 transition-all"
                                value={formData.patient_name}
                                onChange={e => setFormData({ ...formData, patient_name: e.target.value })}
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label text-xs font-bold text-slate-500 mb-1 block">TRATAMIENTO / CONCEPTO</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ej. Profilaxis"
                                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-[#5dc0bb]/20 transition-all"
                                value={formData.treatment_name}
                                onChange={e => setFormData({ ...formData, treatment_name: e.target.value })}
                            />
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="form-label text-xs font-bold text-slate-500 mb-1 block">FECHA</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-[#5dc0bb]/20"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-xs font-bold text-slate-500 mb-1 block">MONTO</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-[#5dc0bb]/20"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <SelectInput
                            label="MÉTODO DE PAGO"
                            value={formData.method}
                            onChange={val => setFormData({ ...formData, method: val })}
                            options={[
                                { value: 'Efectivo', label: 'Efectivo' },
                                { value: 'Transferencia', label: 'Transferencia' },
                                { value: 'Tarjeta', label: 'Tarjeta' }
                            ]}
                        />
                        <SelectInput
                            label="ESTADO"
                            value={formData.status}
                            onChange={val => setFormData({ ...formData, status: val })}
                            options={[
                                { value: 'PAGADO', label: 'PAGADO' },
                                { value: 'PENDIENTE', label: 'PENDIENTE' }
                            ]}
                        />
                    </div>
                </div>

                {/* Footer Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-[#5dc0bb]/30 hover:shadow-[#5dc0bb]/40 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                    style={{ backgroundColor: '#5dc0bb' }}
                >
                    Registrar Ingreso
                </button>
            </div>
        </GlassModal>
    );
}
