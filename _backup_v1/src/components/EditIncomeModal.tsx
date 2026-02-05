import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, ChevronDown } from 'lucide-react';

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

export default function EditIncomeModal({ isOpen, onClose, onSave, initialData }: any) {
    const [formData, setFormData] = useState({
        concept: '',
        amount: '',
        date: '',
        method: 'Efectivo',
        payment_code: '', // Factura/Recibo
        patient_name: '' // Solo lectura
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                concept: initialData.concept || '',
                amount: initialData.amount || '',
                date: initialData.date || new Date().toISOString().split('T')[0],
                method: initialData.method || 'Efectivo',
                payment_code: initialData.payment_code || '',
                patient_name: initialData.patient_name || ''
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="glass-overlay">
            <div className="glass-card-container">
                {/* Screws */}
                <div className="glass-screw tl"></div>
                <div className="glass-screw tr"></div>
                <div className="glass-screw bl"></div>
                <div className="glass-screw br"></div>

                {/* Badge */}
                <div className="glass-badge">
                    INGRESO
                </div>

                <div className="glass-inner-content">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-700">Editar Ingreso</h2>
                            {formData.patient_name && (
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    Paciente: <span className="text-slate-800">{formData.patient_name}</span>
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 -mt-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="form-group">
                            <label className="form-label">CONCEPTO / TRATAMIENTO</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.concept}
                                onChange={e => setFormData({ ...formData, concept: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">FECHA</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="form-input pl-12"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">MONTO</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="form-input pl-12 font-bold text-slate-700"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <SelectInput
                                label="MÉTODO DE PAGO"
                                value={formData.method}
                                onChange={val => setFormData({ ...formData, method: val })}
                                options={[
                                    { value: 'Efectivo', label: 'Efectivo' },
                                    { value: 'Transferencia', label: 'Transferencia' },
                                    { value: 'Tarjeta', label: 'Tarjeta' },
                                    { value: 'Payphone', label: 'Payphone' }
                                ]}
                            />
                            <div className="form-group">
                                <label className="form-label">CÓDIGO / RECIBO</label>
                                <input
                                    type="text"
                                    className="form-input font-mono text-sm"
                                    value={formData.payment_code}
                                    placeholder="N/A"
                                    onChange={e => setFormData({ ...formData, payment_code: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button onClick={handleSubmit} className="btn-full">
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
