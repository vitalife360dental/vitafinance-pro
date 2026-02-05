// Data Model reflecting the "Caja Diaria" Source of Truth

export interface Transaction {
    id: string;
    date: string;       // "27/01/2026"
    daysCounter: number; // e.g., 58 DÍAS
    time: string;       // "05:45 p. m."
    paymentCode: string; // "PAG-20260127-004"
    patientName: string; // "NEYLLIS PEREGRINO" or "-"
    treatment: string;   // "Proforma: CAL..." or "servicio electrico"
    duration?: string;   // "240 min" or "-"
    doctorName?: string; // "Dra. Razibeth Paez" or "-"
    chair?: string;      // "Sillón 1" or "-"
    method: 'TRANSFERENCIA' | 'EFECTIVO' | 'PAYPHONE' | 'TARJETA';
    status: 'ABONO' | 'CANCELADO'; // CANCELADO here means "Paid in Full" / "Cancelado de deuda" usually, or just "Completed"
    amount: number;      // +$30.00
    balance: number;     // $220.00 (Saldo pendiente)
    type: 'INGRESO' | 'EGRESO'; // Implicit from signed amount, but good to track
    category?: 'General' | 'Servicios' | 'Laboratorio' | 'Mantenimiento' | 'Nómina' | 'Insumos' | 'Publicidad' | 'Otros';
    invoice?: string;
}

// ... (Rest of interfaces for Doctor, Goals, etc. remain for the analytics modules)

export interface Doctor {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    production: number;
    hours: number;
    appointments: number;
    cancellations: number;
    rate: number;
}

export interface Goal {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    period: string;
}

export interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string;
    lastVisit: string;
    totalSpent: number;
    pendingBalance: number;
}

// Mock Transactions mimicking the screenshot
export const mockTransactions: Transaction[] = [
    {
        id: '1',
        date: '27/01/2026',
        daysCounter: 58,
        time: '05:45 p. m.',
        paymentCode: 'PAG-20260127-004',
        patientName: 'NEYLLIS PEREGRINO',
        treatment: 'Proforma: CALZA DE RESINA...',
        duration: '-',
        doctorName: 'Dra. Razibeth Paez',
        chair: 'Sillón 1',
        method: 'TRANSFERENCIA',
        status: 'ABONO',
        amount: 30.00,
        balance: 220.00,
        type: 'INGRESO'
    },
    {
        id: '2',
        date: '27/01/2026',
        daysCounter: 58,
        time: '12:10 p. m.',
        paymentCode: 'PAG-20260127-003',
        patientName: '-',
        treatment: 'Pago de Servicio Eléctrico',
        category: 'Servicios',
        duration: '-',
        doctorName: '-',
        chair: '-',
        method: 'TRANSFERENCIA',
        status: 'CANCELADO',
        amount: 70.00,
        balance: 0.00,
        type: 'EGRESO',
        invoice: '001-001-987654'
    },
    {
        id: '3',
        date: '27/01/2026',
        daysCounter: 58,
        time: '12:00 p. m.',
        paymentCode: 'PAG-20260127-002',
        patientName: 'Ezmir Mora',
        treatment: 'Proforma: Diseño de sonrisa',
        duration: '240 min',
        doctorName: 'Dra. Razibeth Paez',
        chair: 'Sillón 1',
        method: 'EFECTIVO',
        status: 'CANCELADO',
        amount: 300.00,
        balance: 0.00,
        type: 'INGRESO'
    },
    {
        id: '4',
        date: '27/01/2026',
        daysCounter: 58,
        time: '11:57 a. m.',
        paymentCode: 'PAG-20260127-001',
        patientName: 'Ezmir Mora',
        treatment: 'CARILLA RESINA...',
        duration: '60 min',
        doctorName: 'Dra. Annabel Rojas',
        chair: 'Sillón 2',
        method: 'PAYPHONE',
        status: 'ABONO',
        amount: 25.00,
        balance: 45.00,
        type: 'INGRESO'
    },
    {
        id: '5',
        date: '26/01/2026',
        daysCounter: 57,
        time: '06:44 p. m.',
        paymentCode: 'PAG-20260126-008',
        patientName: 'David HIDALGO',
        treatment: 'BLANQUEAMIENTO...',
        duration: '60 min',
        doctorName: 'Dr. Diego Lara',
        chair: 'Sillón 1',
        method: 'TARJETA',
        status: 'CANCELADO',
        amount: 130.00,
        balance: 0.00,
        type: 'INGRESO'
    },
    {
        id: '6',
        date: '26/01/2026',
        daysCounter: 57,
        time: '11:05 a. m.',
        paymentCode: 'PAG-20260126-005',
        patientName: 'JUAN ZURITA',
        treatment: 'Cobro Deuda: Blanqueamiento',
        duration: '-',
        doctorName: '-',
        chair: 'Sillón 1',
        method: 'EFECTIVO',
        status: 'CANCELADO',
        amount: 300.00,
        balance: 0.00,
        type: 'INGRESO'
    },
    {
        id: '7',
        date: '26/01/2026',
        daysCounter: 57,
        time: '10:59 a. m.',
        paymentCode: 'PAG-20260126-006',
        patientName: '-',
        treatment: 'Pago de internet',
        category: 'Otros',
        duration: '-',
        doctorName: '-',
        chair: '-',
        method: 'EFECTIVO',
        status: 'CANCELADO',
        amount: 40.00,
        balance: 0.00,
        type: 'EGRESO'
    }
];

// Calculated Summaries
export const dailySummary = {
    totalIngresos: mockTransactions.filter(t => t.type === 'INGRESO').reduce((sum, t) => sum + t.amount, 0),
    totalEgresos: mockTransactions.filter(t => t.type === 'EGRESO').reduce((sum, t) => sum + t.amount, 0),
    netCheck: 0 // Calculated below
};
dailySummary.netCheck = dailySummary.totalIngresos - dailySummary.totalEgresos;

export const mockDailySummary = {
    efectivo: 1250.00,
    transferencias: 800.00,
    payphone: 450.00,
    efectivoMessage: '¡Vas muy bien!',
    transferenciasCount: 4,
    payphoneCount: 2,
};

// ... mockDoctors, mockGoals, mockPatients, dashboardMetrics needed for other views to not break
// Analytics Helpers
export const getDoctorStats = () => {
    const stats: Record<string, Doctor> = {};

    mockTransactions.forEach(t => {
        if (t.doctorName && t.doctorName !== '-') {
            if (!stats[t.doctorName]) {
                stats[t.doctorName] = {
                    id: t.doctorName, // simple ID
                    name: t.doctorName,
                    role: 'ODONTÓLOGO', // default
                    production: 0,
                    hours: 120, // hardcoded for now
                    appointments: 0,
                    cancellations: 0,
                    rate: 0
                };
            }

            const doc = stats[t.doctorName];
            if (t.type === 'INGRESO') {
                doc.production += t.amount;
            }

            // Only count actual appointments, not payments for debts if possible
            // For now, simpler is better: count every transaction as an interaction
            doc.appointments += 1;

            // Calculate rate dynamically
            doc.rate = doc.production / doc.hours;
        }
    });

    return Object.values(stats).sort((a, b) => b.production - a.production);
};

export const getChairStats = () => {
    const stats: Record<string, { name: string, revenue: number, count: number }> = {};

    mockTransactions.forEach(t => {
        if (t.chair && t.chair !== '-') {
            if (!stats[t.chair]) {
                stats[t.chair] = { name: t.chair, revenue: 0, count: 0 };
            }
            if (t.type === 'INGRESO') {
                stats[t.chair].revenue += t.amount;
            }
            stats[t.chair].count += 1;
        }
    });

    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
};

export const getFinancialStats = () => {
    const expensesByCategory: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    mockTransactions.forEach(t => {
        if (t.type === 'INGRESO') {
            totalIncome += t.amount;
        } else if (t.type === 'EGRESO') {
            totalExpenses += t.amount;
            const cat = t.category || 'General';
            expensesByCategory[cat] = (expensesByCategory[cat] || 0) + t.amount;
        }
    });

    return {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        margin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
        expensesByCategory
    };
};

// Re-export mockDoctors as a getter for compatibility with other views
export const mockDoctors: Doctor[] = getDoctorStats();

export const mockGoals: Goal[] = [
    { id: '1', title: 'Ingresos Mensuales', target: 15000, current: 10500, unit: '$', period: 'Enero 2026' },
];

export const mockPatients: Patient[] = [
    { id: '1', name: 'NEYLLIS PEREGRINO', email: 'neyllis@email.com', phone: '099...', lastVisit: '2026-01-27', totalSpent: 30, pendingBalance: 220 },
];

// Payments
export interface Treatment {
    id: string;
    name: string;
    count: number;
    revenue: number;
    avgPrice: number;
    trend: 'up' | 'down' | 'stable';
}

export const mockTreatments: Treatment[] = [
    { id: '1', name: 'Limpieza Dental', count: 145, revenue: 7250, avgPrice: 50, trend: 'up' },
    { id: '2', name: 'Resina', count: 98, revenue: 9800, avgPrice: 100, trend: 'stable' },
    { id: '3', name: 'Blanqueamiento', count: 42, revenue: 12600, avgPrice: 300, trend: 'up' },
    { id: '4', name: 'Ortodoncia', count: 28, revenue: 42000, avgPrice: 1500, trend: 'stable' },
    { id: '5', name: 'Implante', count: 15, revenue: 22500, avgPrice: 1500, trend: 'down' },
];

export const dashboardMetrics = {
    totalToday: dailySummary.totalIngresos,
    totalMonth: 10500,
    pendingBalance: 3200,
    appointmentsToday: 12,
    occupancyRate: 72,
    topDoctor: 'Dra. Razibeth Paez',
};
