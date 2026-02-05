import { useState, useRef, useEffect } from 'react';
import { Upload, Calendar, DollarSign, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { scanInvoiceWithGemini } from '../services/gemini';
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

export function NewExpenseModal({ isOpen, onClose, onSave, initialData }: any) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        concept: initialData?.concept || '',
        amount: initialData?.amount || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        category: initialData?.category || 'General',
        method: initialData?.method || 'Efectivo',
        invoice: initialData?.invoice || '',
        issuer_ruc: initialData?.issuer_ruc || '',
        issuer_name: initialData?.issuer_name || ''
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
                issuer_ruc: initialData.issuer_ruc || '',
                issuer_name: initialData.issuer_name || ''
            });
        } else {
            setFormData({
                concept: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: 'General',
                method: 'Efectivo',
                invoice: '',
                issuer_ruc: '',
                issuer_name: ''
            });
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        // Basic Validation
        if (!formData.amount || !formData.date || !formData.concept) {
            setErrorMsg("Por favor complete Monto, Fecha y Concepto.");
            return;
        }

        setIsSaving(true);
        setErrorMsg('');

        try {
            // Log for debugging
            console.log("Saving expense data:", formData);

            if (!onSave) {
                throw new Error("Function onSave prop is missing");
            }

            await onSave({
                ...formData,
                amount: Number(formData.amount) // Ensure numeric
            });
            onClose();
        } catch (error: any) {
            console.error("Save error:", error);
            setErrorMsg(`Error al guardar: ${error.message || error}`);
        } finally {
            setIsSaving(false);
        }
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
                    issuer_ruc: data.issuer_ruc || prev.issuer_ruc,
                    issuer_name: data.issuer_name || prev.issuer_name
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
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'EDITAR GASTO' : 'REGISTRAR NUEVO GASTO'}
        >
            <div className="space-y-6">
                {/* AI Upload Section */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`ai-upload-box group border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#5dc0bb] hover:bg-[#5dc0bb]/10 transition-all ${isScanning ? 'bg-[#5dc0bb]/10 border-[#5dc0bb]/30' : ''}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                    />
                    <div className={`mx-auto w-12 h-12 bg-[#5dc0bb]/20 rounded-full flex items-center justify-center mb-3 text-[#5dc0bb] group-hover:scale-110 transition-transform ${isScanning ? 'animate-pulse' : ''}`}>
                        {isScanning ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-700 text-lg mb-1">
                            {isScanning ? 'Analizando documento...' : 'Subir Factura / Foto'}
                        </h3>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                            {isScanning ? 'Extrayendo datos con IA...' : 'Autocompletar formulario'}
                        </p>
                        {scanSuccess && <p className="text-emerald-500 text-xs font-bold flex items-center justify-center gap-1 mt-2"><Sparkles size={12} /> Datos cargados</p>}
                        {errorMsg && <p className="text-red-500 text-xs font-bold mt-2">{errorMsg}</p>}
                    </div>
                </div>

                {/* Manual Form */}
                <div className="space-y-5">
                    <div className="form-group">
                        <label className="form-label text-xs font-bold text-slate-500 mb-1 block">CONCEPTO</label>
                        <input
                            type="text"
                            placeholder="Ej. Pago de Alquiler"
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-[#5dc0bb]/20 transition-all"
                            value={formData.concept}
                            onChange={e => setFormData({ ...formData, concept: e.target.value })}
                        />
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group col-span-2">
                            <label className="form-label text-xs font-bold text-slate-400 mb-1 block">NOMBRE / RAZÓN SOCIAL</label>
                            <input
                                type="text"
                                placeholder="Ej. SUPERMAXI S.A."
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-600 text-sm font-bold tracking-wide focus:ring-2 focus:ring-[#5dc0bb]/20"
                                value={formData.issuer_name || ''}
                                onChange={e => setFormData({ ...formData, issuer_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label text-xs font-bold text-slate-400 mb-1 block">NO. FACTURA</label>
                            <input
                                type="text"
                                placeholder="001-001..."
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-600 text-sm font-mono tracking-wide focus:ring-2 focus:ring-[#5dc0bb]/20"
                                value={formData.invoice}
                                onChange={e => setFormData({ ...formData, invoice: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label text-xs font-bold text-slate-400 mb-1 block">RUC EMISOR</label>
                            <input
                                type="text"
                                placeholder="17900..."
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-600 text-sm font-mono tracking-wide focus:ring-2 focus:ring-[#5dc0bb]/20"
                                value={formData.issuer_ruc}
                                onChange={e => setFormData({ ...formData, issuer_ruc: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#5dc0bb] shadow-[#5dc0bb]/30 hover:shadow-[#5dc0bb]/40 hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        initialData ? 'Guardar Cambios' : 'Registrar Gasto'
                    )}
                </button>
            </div>
        </GlassModal>
    );
}
