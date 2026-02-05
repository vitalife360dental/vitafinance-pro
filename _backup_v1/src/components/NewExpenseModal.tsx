import { useState, useRef, useEffect } from 'react';
import { X, Upload, Calendar, DollarSign, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { scanInvoiceWithGemini } from '../services/gemini';

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

export default function NewExpenseModal({ isOpen, onClose, onSave, initialData }: any) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        concept: initialData?.concept || '',
        amount: initialData?.amount || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        category: initialData?.category || 'General',
        method: initialData?.method || 'Efectivo',
        invoice: initialData?.invoice || '',
        issuer_ruc: initialData?.issuer_ruc || ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                concept: initialData.concept || '',
                amount: initialData.amount || '',
                date: initialData.date || new Date().toISOString().split('T')[0],
                category: initialData.category || 'General',
                method: initialData.method || 'Efectivo',
                invoice: initialData.invoice || '',
                issuer_ruc: initialData.issuer_ruc || ''
            });
        } else {
            setFormData({
                concept: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: 'General',
                method: 'Efectivo',
                invoice: '',
                issuer_ruc: ''
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setScanSuccess(false);
        setErrorMsg('');

        try {
            const result = await scanInvoiceWithGemini(file);

            if (result.success && result.data) {
                const data = result.data;
                setFormData(prev => ({
                    ...prev,
                    amount: data.amount ? String(data.amount) : prev.amount,
                    invoice: data.invoice_number || prev.invoice,
                    concept: data.concept || prev.concept,
                    category: data.category || 'General',
                    date: data.date || prev.date,
                    method: data.method || 'EFECTIVO',
                    issuer_ruc: data.issuer_ruc || prev.issuer_ruc
                }));
                setScanSuccess(true);
            } else {
                setErrorMsg("No se pudo detectar información legible.");
            }
        } catch (error: any) {
            console.error(error);
            setErrorMsg("Error al procesar el archivo.");
        } finally {
            setIsScanning(false);
        }
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
                    {initialData ? 'EDICIÓN' : 'NUEVO GASTO'}
                </div>

                {/* Inner White Card */}
                <div className="glass-inner-content">
                    {/* Header with Close Button */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-700">
                                {initialData ? 'Editar Gasto' : 'Registrar Gasto'}
                            </h2>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 -mt-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">

                        {/* AI Upload Section */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`ai-upload-box group ${isScanning ? 'bg-blue-50 border-blue-200' : ''}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                            />
                            <div className={`ai-icon-container group-hover:scale-110 transition-transform ${isScanning ? 'animate-pulse text-blue-500' : ''}`}>
                                {isScanning ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-700 text-lg mb-1">
                                    {isScanning ? 'Analizando documento con IA...' : 'Autocompletar formulario'}
                                </h3>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                                    {isScanning ? 'Extrayendo datos de la factura...' : 'Sube tu factura digital o foto'}
                                </p>
                                {scanSuccess && <p className="text-emerald-500 text-xs font-bold flex items-center gap-1 mt-1"><Sparkles size={12} /> Datos cargados correctamente</p>}
                                {errorMsg && <p className="text-red-500 text-xs font-bold mt-1">{errorMsg}</p>}
                            </div>
                        </div>

                        {/* Manual Form */}
                        <div className="space-y-5">
                            <div className="form-group">
                                <label className="form-label">CONCEPTO</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Pago de Alquiler de Consultorio"
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
                                            className="form-input !pl-14"
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
                                            placeholder="0.00"
                                            className="form-input !pl-14 font-bold text-slate-700"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <SelectInput
                                    label="CATEGORÍA"
                                    value={formData.category}
                                    onChange={val => setFormData({ ...formData, category: val })}
                                    options={[
                                        { value: 'General', label: 'General' },
                                        { value: 'Materiales', label: 'Materiales' },
                                        { value: 'Servicios', label: 'Servicios' },
                                        { value: 'Mantenimiento', label: 'Mantenimiento' },
                                        { value: 'Laboratorio', label: 'Laboratorio' },
                                        { value: 'Nómina', label: 'Nómina' },
                                        { value: 'Publicidad', label: 'Publicidad' },
                                        { value: 'Insumos', label: 'Insumos' },
                                        { value: 'Otros', label: 'Otros' }
                                    ]}
                                />
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
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">NÚMERO DE FACTURA <span className="text-slate-300 font-normal ml-1">(Opcional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="001-001-000012345"
                                        className="form-input font-mono text-sm tracking-wider"
                                        value={formData.invoice}
                                        onChange={e => setFormData({ ...formData, invoice: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">RUC EMISOR</label>
                                    <input
                                        type="text"
                                        placeholder="17900..."
                                        className="form-input font-mono text-sm tracking-wider"
                                        value={formData.issuer_ruc}
                                        onChange={e => setFormData({ ...formData, issuer_ruc: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - No Divider for cleaner look */}
                    <div className="mt-8">
                        <button
                            onClick={handleSubmit}
                            className="btn-full"
                        >
                            {initialData ? 'Guardar Cambios' : 'Registrar Gasto'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
