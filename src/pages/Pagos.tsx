import { useState, useEffect } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { financeService } from '../services/financeService';
import { DollarSign, User, Calendar, CheckCircle, Wallet, History, X } from 'lucide-react';
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {
            const [production, transactionsData, cats] = await Promise.all([
                financeService.getProductionAnalytics(),
                financeService.getTransactions(),
                financeService.getCategories()
            ]);

            setCategories(cats || []);


            // 1. Get Production (Calculated Commissions)
            // const production = await financeService.getProductionAnalytics(); // Already fetched

            // 2. Get Expenses (Actual Payments)
            // const expenses = await financeService.getRecentTransactions(1000); // Fetch enough history
            const payments = transactionsData.filter((t: any) => t.type === 'expense');
            // Filter expenses related to "Honorarios" or "Personal"
            // Simple logic: Check if category is related to Staff/Personal
            // Enhanced logic: Future update could filter by Category ID 4 (Personal)


            // 3. Merge Data
            const doctorStats = production.doctors.map((doc: any) => {
                // Find payments for this doctor (String match on description for now - MVP)
                const docPaymentsList = payments
                    .filter((p: any) => p.description?.toLowerCase().includes(doc.name.toLowerCase()));

                const docPaymentsTotal = docPaymentsList.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

                const totalCommission = doc.tariffs; // This is the "Arancel" calculated in Production (33%)
                const balance = totalCommission - docPaymentsTotal;

                return {
                    ...doc,
                    docPayments: docPaymentsTotal,
                    paymentsList: docPaymentsList, // Store full list for history
                    balance
                };
            });

            const totalCommissions = doctorStats.reduce((sum, d) => sum + d.tariffs, 0);
            const totalPaid = doctorStats.reduce((sum, d) => sum + d.docPayments, 0);

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

    return (
        <PageContainer>
            <PageHeader
                title="Gestión de Pagos y Nómina"
                subtitle="Control de comisiones médicas y registro de honorarios."
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 text-white rounded-xl shadow-sm overflow-hidden p-6">
                    <div className="flex items-center gap-3 mb-2 opacity-80">
                        <Wallet size={20} />
                        <span className="text-sm font-medium">Comisiones Generadas</span>
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
                <div className="p-6 border-b border-slate-100 bg-white">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <User size={20} className="text-slate-400" />
                        Estado de Cuenta por Doctor
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 font-bold text-slate-500">Doctor</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-center">Pacientes</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-right">Facturación</th>
                                <th className="px-6 py-4 font-bold text-slate-800 text-right bg-slate-100/50">Comisión (33%)</th>
                                <th className="px-6 py-4 font-bold text-emerald-600 text-right">Pagado</th>
                                <th className="px-6 py-4 font-bold text-amber-600 text-right">Saldo</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doctors.map((doc) => (
                                <tr key={doc.name} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{doc.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="neutral">{doc.attentions}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600">${doc.billing.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900 bg-slate-50/50">
                                        ${doc.tariffs.toFixed(2)}
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
                            ))}
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
        </PageContainer>
    );
}
