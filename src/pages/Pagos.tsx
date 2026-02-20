import { useState, useEffect } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { financeService } from '../services/financeService';
import { DollarSign, User, Calendar, CheckCircle, Wallet, History, X, Settings, Save, Percent, Plus, Trash2, ChevronDown, ChevronRight, LayoutList, Search } from 'lucide-react';
import { NewExpenseModal } from '../components/NewExpenseModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Pagos() {

    const [doctors, setDoctors] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalCommissions: 0, totalPaid: 0, pending: 0 });
    const [categories, setCategories] = useState<any[]>([]); // Store categories
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [selectedDoctorForPayment, setSelectedDoctorForPayment] = useState<any>(null);

    // History Modal State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedDoctorHistory, setSelectedDoctorHistory] = useState<any>(null);

    // Production Detail Modal State
    const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
    const [selectedDoctorProduction, setSelectedDoctorProduction] = useState<any>(null);

    // Commission Config Modal State
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    // Structure: { doctorName: { _default: 33, Ortodoncia: 50, ... } }
    const [commissionRules, setCommissionRules] = useState<Record<string, Record<string, number>>>({});
    const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
    const [newCategoryInputs, setNewCategoryInputs] = useState<Record<string, string>>({});
    const [treatmentNames, setTreatmentNames] = useState<string[]>([]);
    const [savingConfig, setSavingConfig] = useState(false);
    const [editingField, setEditingField] = useState<{ doctor: string; cat: string; original: number } | null>(null);
    const [saveToast, setSaveToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (overrideRules?: Record<string, Record<string, number>>) => {

        try {
            const [production, transactionsData, cats, dbCommissions, aranceles] = await Promise.all([
                financeService.getProductionAnalytics(),
                financeService.getTransactions(),
                financeService.getCategories(),
                financeService.getDoctorCommissions(),
                financeService.getAranceles()
            ]);

            setCategories(cats || []);

            // Extract unique treatment names for the dropdown
            const uniqueTreatments = [...new Set((aranceles || []).map((a: any) => a.name).filter(Boolean))];
            setTreatmentNames(uniqueTreatments.sort());

            // Build commission rules map from DB OR use override
            let rulesMap: Record<string, Record<string, number>> = overrideRules || {};

            if (!overrideRules) {
                (dbCommissions || []).forEach((rule: any) => {
                    const docName = rule.name || rule.doctor_name || '';
                    const category = rule.category || '_default';
                    if (!rulesMap[docName]) rulesMap[docName] = {};
                    rulesMap[docName][category] = Number(rule.commission_rate);
                });
            }

            // 2. Get Expenses (Actual Payments)
            const payments = transactionsData.filter((t: any) => t.type === 'expense');

            // 3. Merge Data
            const doctorStats = production.doctors.map((doc: any) => {
                const docPaymentsList = payments
                    .filter((p: any) => p.description?.toLowerCase().includes(doc.name.toLowerCase()));

                const docPaymentsTotal = docPaymentsList.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

                const totalCommission = doc.tariffs;
                const balance = totalCommission - docPaymentsTotal;

                // Ensure this doctor exists in rulesMap with at least a default
                if (!rulesMap[doc.name]) {
                    rulesMap[doc.name] = { '_default': 33 };
                } else if (!rulesMap[doc.name]['_default']) {
                    rulesMap[doc.name]['_default'] = 33;
                }

                return {
                    ...doc,
                    docPayments: docPaymentsTotal,
                    paymentsList: docPaymentsList,
                    balance,
                    // Use the base rate we just fetched/calculated, not the one from analytics which might be partial
                    commissionPercent: (rulesMap[doc.name]['_default'] || 33)
                };
            });

            setCommissionRules(rulesMap);

            const totalCommissions = doctorStats.reduce((sum: number, d: any) => sum + d.tariffs, 0);
            const totalPaid = doctorStats.reduce((sum: number, d: any) => sum + d.docPayments, 0);

            setDoctors(doctorStats);
            setSummary({
                totalCommissions,
                totalPaid,
                pending: totalCommissions - totalPaid
            });

        } catch (error) {
            console.error(error);
        } finally {

        }
    };

    const handleOpenPayment = (doctor: any) => {
        setSelectedDoctorForPayment(doctor);
        setIsExpenseModalOpen(true);
    };

    const handleSaveCommissions = async () => {
        setSavingConfig(true);
        try {
            let saved = 0;
            for (const [doctorName, categories] of Object.entries(commissionRules)) {
                for (const [category, rate] of Object.entries(categories)) {
                    await financeService.upsertDoctorCommission(doctorName, category, rate);
                    saved++;
                }
            }
            // Close modal and clear state
            setEditingField(null);
            setExpandedDoctor(null);
            setIsConfigModalOpen(false);
            setSavingConfig(false);
            // Show toast AFTER modal is closed
            setSaveToast({ message: `✅ Guardado exitoso (${saved} reglas)`, type: 'success' });
            setTimeout(() => setSaveToast(null), 4000);

            // Reload data with override rules to ensure UI updates immediately
            // We pass the current local state so we don't wait for stale DB read
            setTimeout(() => loadData(commissionRules), 500);
        } catch (error: any) {
            console.error('Error saving commissions:', error);
            const msg = error?.message || 'Error desconocido';
            setSavingConfig(false);
            setSaveToast({ message: `❌ Error: ${msg}`, type: 'error' });
            setTimeout(() => setSaveToast(null), 6000);
        }
    };

    const addCategoryRule = (doctorName: string) => {
        const cat = newCategoryInputs[doctorName];
        if (!cat) return;
        setCommissionRules(prev => ({
            ...prev,
            [doctorName]: {
                ...prev[doctorName],
                [cat]: 33
            }
        }));
        setNewCategoryInputs(prev => ({ ...prev, [doctorName]: '' }));
    };

    const removeCategoryRule = async (doctorName: string, category: string) => {
        // 1. Collapse the expanded panel to avoid React DOM reconciliation crash
        setExpandedDoctor(null);

        // 2. Delete from DB
        try {
            await financeService.deleteDoctorCommissionByName(doctorName, category);
        } catch (e) {
            console.warn('Could not delete from DB:', e);
        }

        // 3. Reload all data from server (clean state)
        loadData();
    };

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageContainer>
            {/* Toast Notification */}
            {saveToast && (
                <div style={{
                    position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 9999, padding: '14px 28px', borderRadius: '12px',
                    color: 'white', fontSize: '15px', fontWeight: 600,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    background: saveToast.type === 'success'
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {saveToast.message}
                </div>
            )}

            <PageHeader
                title="Gestión de Pagos y Nómina"
                subtitle="Control de aranceles médicos y registro de honorarios."
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 text-white rounded-xl shadow-sm overflow-hidden p-6">
                    <div className="flex items-center gap-3 mb-2 opacity-80">
                        <Wallet size={20} />
                        <span className="text-sm font-medium">Aranceles Generados</span>
                    </div>
                    <div className="text-3xl font-black">${summary.totalCommissions.toFixed(2)}</div>
                </div>
                <Card>
                    <div className="flex items-center gap-3 mb-2 text-emerald-600">
                        <CheckCircle size={20} />
                        <span className="text-sm font-bold">Total Pagado</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800">${summary.totalPaid.toFixed(2)}</div>
                </Card>
                <Card noPadding>
                    <div className="p-6 relative overflow-hidden h-full">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-amber-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                        <div className="flex items-center gap-3 mb-2 text-amber-600 relative z-10">
                            <Calendar size={20} />
                            <span className="text-sm font-bold">Pendiente de Pago</span>
                        </div>
                        <div className="text-3xl font-black text-slate-800 relative z-10">${(summary.pending || 0).toFixed(2)}</div>
                    </div>
                </Card>
            </div>

            {/* Doctors Table */}
            <Card className="overflow-hidden shadow-sm border border-slate-200" noPadding>
                <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 shrink-0">
                            <User size={20} className="text-slate-400" />
                            Estado de Cuenta
                        </h3>
                        <div className="relative max-w-xs w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar doctor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5dc0bb]/20 focus:border-[#5dc0bb] outline-none transition-all"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-colors"
                    >
                        <Settings size={16} />
                        Configurar Aranceles
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 font-bold text-slate-500">Doctor</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-center">Pacientes</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-right">Utilidad</th>
                                <th className="px-6 py-4 font-bold text-slate-800 text-right bg-slate-100/50">Arancel</th>
                                <th className="px-6 py-4 font-bold text-emerald-600 text-right">Pagado</th>
                                <th className="px-6 py-4 font-bold text-amber-600 text-right">Saldo</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron doctores con ese nombre.
                                    </td>
                                </tr>
                            ) : (
                                filteredDoctors.map((doc) => {
                                    const docRules = commissionRules[doc.name] || {};
                                    const categoryOverrides = Object.entries(docRules).filter(([k]) => k !== '_default');

                                    return (
                                        <tr key={doc.name} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-slate-800">{doc.name}</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                                                            Base: {docRules['_default'] || 33}%
                                                        </span>
                                                        {categoryOverrides.map(([cat, rate]) => (
                                                            <span key={cat} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded font-medium border border-amber-100">
                                                                {cat}: {rate}%
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="neutral">{doc.attentions}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-600">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold">${(doc.commissionableBase || 0).toFixed(2)}</span>
                                                    <span className="text-[10px] text-slate-400">de ${doc.billing.toFixed(2)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900 bg-slate-50/50">
                                                <div className="flex flex-col items-end">
                                                    <span>${doc.tariffs.toFixed(2)}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">{doc.commissionPercent || 33}% prom.</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                                ${doc.docPayments.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-amber-600">
                                                ${doc.balance.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDoctorHistory(doc);
                                                            setIsHistoryModalOpen(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                                        title="Ver Historial de Pagos"
                                                    >
                                                        <History size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedDoctorProduction(doc);
                                                            setIsProductionModalOpen(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                                                        title="Ver Desglose de Producción"
                                                    >
                                                        <LayoutList size={18} />
                                                    </button>

                                                    {doc.balance > 0.01 ? (
                                                        <button
                                                            onClick={() => handleOpenPayment(doc)}
                                                            className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1"
                                                        >
                                                            <DollarSign size={14} /> Pagar
                                                        </button>
                                                    ) : (
                                                        <Badge variant="success">Al día</Badge>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Payment Modal using existing NewExpenseModal */}
            {selectedDoctorForPayment && (
                <NewExpenseModal
                    isOpen={isExpenseModalOpen}
                    onClose={() => {
                        setIsExpenseModalOpen(false);
                        setSelectedDoctorForPayment(null);
                    }}
                    onSave={async (data: any) => {
                        try {
                            await financeService.createTransaction({
                                amount: data.amount,
                                description: data.concept,
                                date: data.date,
                                category_id: categories.find(c => ['Personal', 'Nómina', 'Salarios'].includes(c.name))?.id || categories.find(c => c.type === 'expense')?.id || 1,
                                type: 'expense',
                                method: 'Transferencia', // Default for now
                                doctor_name: selectedDoctorForPayment.name,
                                invoice_number: data.invoice, // Save Invoice Number!
                                issuer_ruc: data.issuer_ruc, // Save RUC
                                issuer_name: data.issuer_name // Save Name
                            });

                            setIsExpenseModalOpen(false);
                            setSelectedDoctorForPayment(null);
                            loadData(); // Refresh summary
                        } catch (error) {
                            console.error("Error creating payment:", error);
                            alert("Error al guardar el pago");
                        }
                    }}
                    initialData={{
                        amount: selectedDoctorForPayment.balance,
                        concept: `Pago Honorarios - ${selectedDoctorForPayment.name}`, // 'concept' for UI, mapped to description
                        displayCategory: 'Personal'
                    }}
                />
            )}

            {/* History Modal */}
            {isHistoryModalOpen && selectedDoctorHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Historial de Pagos</h3>
                                <p className="text-sm text-slate-500">Doctor: <span className="font-semibold text-slate-700">{selectedDoctorHistory.name}</span></p>
                            </div>
                            <button
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6">
                            {selectedDoctorHistory.paymentsList && selectedDoctorHistory.paymentsList.length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(
                                        selectedDoctorHistory.paymentsList.reduce((groups: any, payment: any) => {
                                            const monthKey = format(new Date(payment.date), 'MMMM yyyy', { locale: es });
                                            if (!groups[monthKey]) groups[monthKey] = [];
                                            groups[monthKey].push(payment);
                                            return groups;
                                        }, {})
                                    ).map(([month, payments]: [string, any]) => (
                                        <div key={month}>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 sticky top-0 bg-white py-2">
                                                {month}
                                            </h4>
                                            <div className="space-y-3">
                                                {payments.map((payment: any) => (
                                                    <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                                <DollarSign size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-700">{payment.description}</p>
                                                                <p className="text-xs text-slate-400">{format(new Date(payment.date), 'dd MMM yyyy', { locale: es })}</p>
                                                            </div>
                                                        </div>
                                                        <span className="font-bold text-emerald-600">
                                                            ${Number(payment.amount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-end pt-2 border-t border-slate-100 border-dashed">
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        Total Mes: <span className="text-slate-800 font-bold">${payments.reduce((acc: number, cur: any) => acc + Number(cur.amount), 0).toFixed(2)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No hay pagos registrados para este doctor.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Commission Config Modal */}
            {isConfigModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Percent size={20} className="text-[#5dc0bb]" />
                                    Configurar Aranceles
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Define el % base y reglas por tratamiento para cada doctor.</p>
                            </div>
                            <button
                                onClick={() => { setIsConfigModalOpen(false); setExpandedDoctor(null); }}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6 space-y-3">
                            {Object.keys(commissionRules).length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <User size={40} className="mx-auto mb-3 opacity-30" />
                                    <p>No hay doctores registrados aún.</p>
                                </div>
                            ) : (
                                Object.entries(commissionRules)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([doctorName, rules]) => {
                                        const isExpanded = expandedDoctor === doctorName;
                                        const categoryOverrides = Object.entries(rules).filter(([k]) => k !== '_default');

                                        return (
                                            <div key={doctorName} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                                {/* Doctor Row */}
                                                <div className="flex items-center justify-between p-4">
                                                    <button
                                                        onClick={() => setExpandedDoctor(isExpanded ? null : doctorName)}
                                                        className="flex items-center gap-3 text-left flex-1"
                                                    >
                                                        {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                                        <div className="w-9 h-9 rounded-full bg-[#5dc0bb]/10 flex items-center justify-center text-[#5dc0bb] font-bold text-sm">
                                                            {doctorName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-700 text-sm">{doctorName}</span>
                                                            {categoryOverrides.length > 0 && (
                                                                <span className="ml-2 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">
                                                                    {categoryOverrides.length} regla{categoryOverrides.length > 1 ? 's' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-400">Base:</span>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            value={editingField?.doctor === doctorName && editingField?.cat === '_default' ? (rules['_default'] === 0 ? '' : rules['_default']) : (rules['_default'] || 33)}
                                                            onFocus={() => {
                                                                const current = rules['_default'] || 33;
                                                                setEditingField({ doctor: doctorName, cat: '_default', original: current });
                                                                setCommissionRules(prev => ({
                                                                    ...prev,
                                                                    [doctorName]: { ...prev[doctorName], '_default': 0 }
                                                                }));
                                                            }}
                                                            onBlur={() => {
                                                                const current = rules['_default'];
                                                                if (!current || current === 0) {
                                                                    const restore = editingField?.original || 33;
                                                                    setCommissionRules(prev => ({
                                                                        ...prev,
                                                                        [doctorName]: { ...prev[doctorName], '_default': restore }
                                                                    }));
                                                                }
                                                                setEditingField(null);
                                                            }}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(/[^0-9]/g, '');
                                                                const val = raw === '' ? 0 : Math.min(100, Number(raw));
                                                                setCommissionRules(prev => ({
                                                                    ...prev,
                                                                    [doctorName]: {
                                                                        ...prev[doctorName],
                                                                        '_default': val
                                                                    }
                                                                }));
                                                            }}
                                                            className="w-16 text-right px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#5dc0bb] focus:border-transparent outline-none"
                                                        />
                                                        <span className="text-sm font-bold text-slate-400">%</span>
                                                    </div>
                                                </div>

                                                {/* Expanded: Category Overrides */}
                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 bg-white p-4 space-y-2">
                                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reglas por Tratamiento</p>

                                                        {categoryOverrides.length === 0 && (
                                                            <p className="text-xs text-slate-400 italic py-2">Sin reglas específicas. Se usará {rules['_default'] || 33}% para todo.</p>
                                                        )}

                                                        {categoryOverrides.map(([cat, rate]) => (
                                                            <div key={cat} className="flex items-center justify-between gap-2 py-1.5">
                                                                <span className="text-sm text-slate-600 flex-1">
                                                                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">{cat}</span>
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        pattern="[0-9]*"
                                                                        value={editingField?.doctor === doctorName && editingField?.cat === cat ? (rate === 0 ? '' : rate) : rate}
                                                                        onFocus={() => {
                                                                            setEditingField({ doctor: doctorName, cat, original: rate });
                                                                            setCommissionRules(prev => ({
                                                                                ...prev,
                                                                                [doctorName]: { ...prev[doctorName], [cat]: 0 }
                                                                            }));
                                                                        }}
                                                                        onBlur={() => {
                                                                            const current = rules[cat];
                                                                            if (!current || current === 0) {
                                                                                const restore = editingField?.original || 33;
                                                                                setCommissionRules(prev => ({
                                                                                    ...prev,
                                                                                    [doctorName]: { ...prev[doctorName], [cat]: restore }
                                                                                }));
                                                                            }
                                                                            setEditingField(null);
                                                                        }}
                                                                        onChange={(e) => {
                                                                            const raw = e.target.value.replace(/[^0-9]/g, '');
                                                                            const val = raw === '' ? 0 : Math.min(100, Number(raw));
                                                                            setCommissionRules(prev => ({
                                                                                ...prev,
                                                                                [doctorName]: {
                                                                                    ...prev[doctorName],
                                                                                    [cat]: val
                                                                                }
                                                                            }));
                                                                        }}
                                                                        className="w-16 text-right px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#5dc0bb] focus:border-transparent outline-none"
                                                                    />
                                                                    <span className="text-xs text-slate-400">%</span>
                                                                    <button
                                                                        onClick={() => removeCategoryRule(doctorName, cat)}
                                                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                        title="Eliminar regla"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Add new category rule */}
                                                        <div className="flex items-center gap-2 pt-2 border-t border-dashed border-slate-100">
                                                            <select
                                                                value={newCategoryInputs[doctorName] || ''}
                                                                onChange={(e) => setNewCategoryInputs(prev => ({ ...prev, [doctorName]: e.target.value }))}
                                                                className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-[#5dc0bb] focus:border-transparent outline-none bg-white"
                                                            >
                                                                <option value="">Seleccionar tratamiento...</option>
                                                                {treatmentNames
                                                                    .filter(c => !rules[c]) // Don't show already-added treatments
                                                                    .map(tName => (
                                                                        <option key={tName} value={tName}>{tName}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <button
                                                                onClick={() => addCategoryRule(doctorName)}
                                                                disabled={!newCategoryInputs[doctorName]}
                                                                className="p-1.5 bg-[#5dc0bb] text-white rounded-lg hover:bg-[#4da9a5] transition-colors disabled:opacity-30"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-3">
                            <p className="text-xs text-slate-400">Prioridad: Tratamiento → Especialidad → Base → 33%</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setIsConfigModalOpen(false); setExpandedDoctor(null); }}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveCommissions}
                                    disabled={savingConfig}
                                    className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={14} />
                                    {savingConfig ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Production Detail Modal */}
            {isProductionModalOpen && selectedDoctorProduction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-teal-100 text-teal-600 rounded-xl">
                                    <LayoutList size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Desglose de Producción</h3>
                                    <p className="text-sm text-slate-500 font-medium">Doctor: <span className="text-slate-900">{selectedDoctorProduction.name}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsProductionModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6 bg-slate-50/30">
                            {selectedDoctorProduction.ops && selectedDoctorProduction.ops.length > 0 ? (
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="bg-slate-100/80 border-b border-slate-200">
                                                <th className="px-5 py-4 font-bold text-slate-600">Fecha</th>
                                                <th className="px-5 py-4 font-bold text-slate-600">Paciente</th>
                                                <th className="px-4 py-4 font-bold text-slate-600">Tratamiento</th>
                                                <th className="px-5 py-4 font-bold text-slate-600 text-right">Utilidad</th>
                                                <th className="px-5 py-4 font-bold text-slate-600 text-center">% Arancel</th>
                                                <th className="px-5 py-4 font-bold text-teal-600 text-right bg-teal-50/30">Arancel</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedDoctorProduction.ops.map((op: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-5 py-3 text-slate-500">{format(new Date(op.date), 'dd MMM', { locale: es })}</td>
                                                    <td className="px-5 py-3 font-semibold text-slate-700">{op.patient}</td>
                                                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{op.treatment}</td>
                                                    <td className="px-5 py-3 text-right text-slate-500 font-medium">
                                                        ${(op.netBase || 0).toFixed(2)}
                                                        <div className="text-[9px] text-slate-400">de ${(op.amount || 0).toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${op.commissionRate === (selectedDoctorProduction.commissionRate / 100) ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                                                            {(op.commissionRate * 100).toFixed(0)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-black text-teal-600 bg-teal-50/10">
                                                        ${op.commissionAmount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-slate-900 text-white">
                                                <td colSpan={3} className="px-5 py-4 font-bold text-teal-400">TOTAL GENERADO</td>
                                                <td className="px-5 py-4 text-right font-bold opacity-80">${(selectedDoctorProduction.commissionableBase || 0).toFixed(2)}</td>
                                                <td className="px-5 py-4"></td>
                                                <td className="px-5 py-4 text-right text-lg font-black">${selectedDoctorProduction.tariffs.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                                    <LayoutList size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-slate-400 font-medium">No hay registros detallados para este periodo.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                            <button
                                onClick={() => setIsProductionModalOpen(false)}
                                className="px-6 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
