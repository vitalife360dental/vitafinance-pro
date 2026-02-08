import { useState, useEffect } from 'react';
import { Calendar, DollarSign, FileText, ChevronDown } from 'lucide-react';
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

export default function NewOtherIncomeModal({ isOpen, onClose, onSave, initialData }: any) {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Efectivo',
        status: 'PAGADO',
        invoice_number: ''
    });

    // Reset when opening or when initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    description: initialData.description || '',
                    amount: initialData.amount || '',
                    date: initialData.date || new Date().toISOString().split('T')[0],
                    method: initialData.method || 'Efectivo',
                    status: initialData.status === 'CANCELADO' ? 'PAGADO' : (initialData.status || 'PAGADO'),
                    invoice_number: initialData.invoice_number || ''
                });
            } else {
                setFormData({
                    description: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    method: 'Efectivo',
                    status: 'PAGADO',
                    invoice_number: ''
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    return (
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "EDITAR OTRO INGRESO" : "REGISTRAR OTRO INGRESO"}
        >
            <div className="space-y-6">

                {/* Manual Form */}
                <div className="space-y-5">

                    <div className="form-group">
                        <label className="form-label text-xs font-bold text-slate-500 mb-1 block">CONCEPTO / DESCRIPCIÓN</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ej. Venta de Cepillos, Pasta Dental..."
                                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-[#5dc0bb]/20 transition-all"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
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

                    <div className="form-group">
                        <label className="form-label text-xs font-bold text-slate-500 mb-1 block">NÚMERO DE FACTURA</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="001-001-000000001"
                                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-[#5dc0bb]/20"
                                value={formData.invoice_number}
                                onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                            />
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
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
