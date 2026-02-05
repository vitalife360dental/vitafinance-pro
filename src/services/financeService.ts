import { supabase } from '../lib/supabase';

export interface Transaction {
    id: string | number;
    amount: number;
    description?: string;
    date: string;
    category_id?: number;
    category_name?: string;
    type: 'income' | 'expense';

    // DentalFlow Fields
    patient_name?: string;
    doctor_name?: string;
    treatment_name?: string;
    payment_code?: string;
    status?: string;
    method?: string;
    balance?: number;
    transaction_time?: string;
    issuer_ruc?: string;
    issuer_name?: string;

    // Computed/Display Fields
    category?: string;
    concept?: string;
    displayDate?: string;
    daysCounter?: number;

    created_at?: string;
}

export interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string;
}

export const financeService = {
    // --- Transactions ---

    async getRecentTransactions(limit = 10) {
        const { data, error } = await supabase
            .from('vf_transactions')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent transactions:', error);
            return [];
        }
        return data || [];
    },

    async getTransactions() {
        console.log('Fetching financial data (Merged Stream from transactions)...');

        // 1. Fetch Local Data (Expenses from vf_transactions)
        let localData: any[] = [];
        try {
            const { data, error } = await supabase
                .from('vf_transactions')
                .select(`
                    *,
                    vf_categories (
                      id,
                      name,
                      color,
                      icon
                    )
                `)
                .order('date', { ascending: false });

            if (error) {
                console.warn('Local fetch failed (vf_transactions missing?):', error.message);
            } else if (data) {
                localData = data;
            }
        } catch (localErr) {
            console.warn('Local fetch exception:', localErr);
        }

        // 2. Fetch External Data (Income from 'transactions')
        let externalData: any[] = [];
        try {
            const { data: extDocs, error: extError } = await supabase
                .from('transactions')
                .select('*')
                // Basic filtering, but we handle details in mapping
                .order('date', { ascending: false })
                .limit(500);

            if (!extError && extDocs) {
                externalData = extDocs;
            } else {
                console.warn('Could not fetch from transactions', extError);
            }
        } catch (err) {
            console.warn('External fetch failed', err);
        }

        // 3. Process & Merge

        // Map Local (Expenses)
        const mappedLocal = localData.map(t => {
            const diffTime = Math.abs(new Date().getTime() - new Date(t.date).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                ...t,
                id: t.id,
                type: (t.type === 'expense' || t.type === 'EGRESO') ? 'expense' : 'income',
                concept: t.treatment_name || t.description || 'Movimiento Manual',
                category: t.vf_categories?.name || 'General',
                amount: Number(t.amount),
                balance: Number(t.balance || 0),
                displayDate: t.date,
                displayTime: t.transaction_time?.slice(0, 5) || '00:00',
                daysCounter: diffDays,
                payment_code: t.payment_code || '-',
                patient_name: t.patient_name || '-',
                treatment_name: t.treatment_name || t.description || '-',
                duration: '-',
                doctor_name: t.doctor_name || '-',
                chair: '-',
                method: t.method || 'Efectivo',
                status: t.status || 'CANCELADO',
                source: 'VitaFinance'
            };
        });

        // Map External (Income from transactions)
        const mappedExternal = externalData.map(t => {
            // Amount
            const amount = Number(t.amount || 0);

            // Date Parsing
            const dateObj = t.date || t.created_at || new Date().toISOString();
            const dateStr = String(dateObj).split('T')[0];
            const timeStr = (String(dateObj).includes('T') ? String(dateObj).split('T')[1].slice(0, 5) : '00:00');

            const diffTime = Math.abs(new Date().getTime() - new Date(dateStr).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Determine Type
            const rawType = t.type || 'Ingreso'; // Default to Ingreso if missing
            const isExpense = rawType.toLowerCase().includes('egreso') || rawType.toLowerCase().includes('gasto');
            const type = isExpense ? 'expense' : 'income';

            // Filter out expenses from standard dentalflow if needed, BUT user said it has everything.
            // For now, let's treat "Ingreso" as income and ignore others unless we want to replace local Egresos too.
            // PROPOSAL: Only import Income from here to avoid dupes with vf_transactions if they overlap.

            if (type !== 'income') return null; // Skip non-income from this source for now to be safe

            return {
                id: t.id, // Keep original UUID
                amount: amount,
                description: t.description || 'Sin descripción',
                date: dateStr,
                type: 'income',
                category_id: null,
                category_name: 'Tratamientos',

                daysCounter: diffDays,
                displayTime: timeStr,
                payment_code: t.payment_code || '-',
                patient_name: t.patient_name || 'Paciente General',
                treatment_name: t.treatment_name || 'Consulta',
                duration: t.duration ? `${t.duration} min` : '30 min',
                doctor_name: t.provider_name || 'Dr. General', // Mapped verified column
                chair: t.operatory_name || 'Sillón 1',  // Mapped verified column
                method: t.method || 'EFECTIVO',
                status: t.payment_status || 'CANCELADO',
                balance: Number(t.balance || 0),

                concept: t.treatment_name || t.description || 'Consulta',
                category: 'Ingresos Clínicos',
                displayDate: dateStr,
                source: 'DentalFlow'
            };
        }).filter(Boolean); // Remote nulls

        const merged = [...mappedLocal, ...mappedExternal];

        return merged.sort((a, b) => {
            const dateA = new Date(a.displayDate).getTime();
            const dateB = new Date(b.displayDate).getTime();
            return dateB - dateA;
        });
    },

    async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
        // Transform UI data to DB structure
        const dbPayload = {
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date,
            type: transaction.type,
            category_id: transaction.category_id,

            patient_name: transaction.patient_name,
            doctor_name: transaction.doctor_name,
            treatment_name: transaction.treatment_name,
            payment_code: transaction.payment_code,
            status: transaction.status,
            method: transaction.method,
            balance: transaction.balance,
            transaction_time: transaction.transaction_time,
            issuer_ruc: transaction.issuer_ruc,
            issuer_name: transaction.issuer_name
        };

        const { data, error } = await supabase
            .from('vf_transactions')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTransaction(id: string | number, updates: Partial<Transaction>) {
        const { data, error } = await supabase
            .from('vf_transactions')
            .update({
                amount: updates.amount,
                description: updates.description,
                date: updates.date,
                type: updates.type,
                category_id: updates.category_id,

                patient_name: updates.patient_name,
                doctor_name: updates.doctor_name,
                treatment_name: updates.treatment_name,
                payment_code: updates.payment_code,
                status: updates.status,
                method: updates.method,
                balance: updates.balance,
                transaction_time: updates.transaction_time,
                issuer_ruc: updates.issuer_ruc,
                issuer_name: updates.issuer_name
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTransaction(id: string | number) {
        const { error } = await supabase
            .from('vf_transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // --- Categories ---

    async getCategories() {
        const { data, error } = await supabase
            .from('vf_categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    // --- Aranceles (Price List) ---
    // Connects to DentalFlow's master table (treatments)

    async getAranceles() {
        console.log('Fetching standard prices from treatments...');

        const { data, error } = await supabase
            .from('treatments')
            .select('*')
            .order('name');

        if (error) {
            console.warn('Error reading treatments table:', error.message);
            return [];
        }

        return data.map((t: any) => {
            const price = Number(t.price || 0);
            return {
                id: t.id,
                name: t.name || 'Tratamiento',
                category: t.category || 'General',
                duration: t.duration || '30 min',
                price: price,
                commission: price * 0.33, // 33% calculation
                doctor_commission: price * 0.33, // Alias for clarity
                source: 'DentalFlow'
            };
        });
    },

    async createArancel(_item: { name: string; price: number }) {
        // Warning: We probably can't write to the external table directly without more perms.
        console.warn('Creating new treatments in external DB is restricted.');
        return null;
    },

    // --- Diagnostics ---
    async checkTableExists(tableName: string) {
        const { error } = await supabase.from(tableName).select('*').limit(1);
        if (error && error.code === '42P01') {
            return false;
        }
        return true;
    },

    async getTablePreview(tableName: string) {
        const { data, error } = await supabase.from(tableName).select('*').limit(5);
        if (error) return { data: [], error };
        return { data, error: null };
    },

    // --- Patients Integration ---
    async getPatients() {
        // Try to fetch from standard DentalFlow 'patients' table
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .limit(50); // Fetch top 50 mostly for performance in this demo

            if (error) throw error;

            return data.map((p: any) => ({
                id: p.id,
                name: p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : (p.name || 'Paciente'),
                email: p.email || '-',
                phone: p.mobile || p.phone || '-',
                lastVisit: p.updated_at || new Date().toISOString(),
                totalSpent: 0, // Would need complex join
                pendingBalance: 0, // Would need complex join
                source: 'DentalFlow'
            }));
        } catch (e) {
            console.warn('Patients table not found or accessible:', e);
            return [];
        }
    },

    // --- Dashboard Analytics ---
    async getDashboardMetrics() {
        // 1. Get all transactions (this internally fetches both Income and Expenses)
        const transactions = await this.getTransactions();

        // 2. Filter for "Today" and "This Month"
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const todayTx = transactions.filter(t => t.displayDate === todayStr);
        const monthTx = transactions.filter(t => {
            const d = new Date(t.displayDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // 3. Calculate Totals (Today)
        const incomeToday = todayTx
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const expenseToday = todayTx
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        // Calculate Totals (Month)
        const incomeMonth = monthTx
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const expenseMonth = monthTx
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const appointmentsMonth = monthTx.filter(t => t.type === 'income').length;

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        // 4. Calculate pending (Simplification: Sum 'balance' field from all transactions)
        const pendingBalance = transactions.reduce((sum, t) => sum + Number(t.balance || 0), 0);

        return {
            today: {
                income: incomeToday,
                expense: expenseToday,
                net: incomeToday - expenseToday,
                appointments: todayTx.filter(t => t.type === 'income').length
            },
            month: {
                income: incomeMonth,
                expense: expenseMonth,
                appointments: appointmentsMonth
            },
            total: {
                income: totalIncome,
                expense: totalExpense,
                balance: pendingBalance
            }
        };
    },

    // --- Production Analytics Engine 🏭 ---
    async getProductionAnalytics() {
        // 1. Fetch Base Data
        const [transactions, treatments] = await Promise.all([
            this.getTransactions(),
            this.getAranceles()
        ]);

        // 2. Filter for Income (Production)
        const incomeTx = transactions.filter(t => t.type === 'income');

        // 3. Process each transaction to calculate margins
        const processedOps = incomeTx.map(tx => {
            // Find relevant tariff/arancel based on treatment name
            // Logic: Fuzzy match or direct name match. For now, direct name.
            const relatedTreatment = treatments.find(t => t.name === tx.treatment_name || t.name === tx.description);
            const tariffCost = relatedTreatment ? (Number(relatedTreatment.price) * 0.33) : 0; // Simulated tariff logic

            // Estimated Supplies (Insumos) - Rule of thumb: 15% of price if not specified
            const suppliesCost = Number(tx.amount) * 0.15;

            const netUtility = Number(tx.amount) - tariffCost - suppliesCost;

            return {
                ...tx,
                tariffCost,
                suppliesCost,
                netUtility,
                chair: tx.chair || 'Sillón Indefinido',
                doctor: tx.doctor_name || 'Dr. General'
            };
        });

        // 4. Aggregations

        // A. Summary KPIs
        const totalBilling = processedOps.reduce((sum, op) => sum + Number(op.amount), 0);
        const totalTariffs = processedOps.reduce((sum, op) => sum + op.tariffCost, 0);
        const totalSupplies = processedOps.reduce((sum, op) => sum + op.suppliesCost, 0);
        const totalUtility = processedOps.reduce((sum, op) => sum + op.netUtility, 0);

        // B. By Chair
        const chairsDict: Record<string, any> = {};
        processedOps.forEach(op => {
            if (!chairsDict[op.chair]) {
                chairsDict[op.chair] = { name: op.chair, hours: 0, billing: 0, tariffs: 0, utility: 0, count: 0 };
            }
            chairsDict[op.chair].billing += Number(op.amount);
            chairsDict[op.chair].tariffs += op.tariffCost;
            chairsDict[op.chair].utility += op.netUtility;
            chairsDict[op.chair].count += 1;
            chairsDict[op.chair].hours += 0.5; // Assume 30 min per op average for now
        });
        const chairsList = Object.values(chairsDict).map(c => ({
            ...c,
            hourlyRate: c.hours > 0 ? (c.utility / c.hours) : 0
        }));

        // C. By Doctor
        const doctorsDict: Record<string, any> = {};
        processedOps.forEach(op => {
            if (!doctorsDict[op.doctor]) {
                doctorsDict[op.doctor] = { name: op.doctor, attentions: 0, billing: 0, tariffs: 0, netContribution: 0 };
            }
            doctorsDict[op.doctor].attentions += 1;
            doctorsDict[op.doctor].billing += Number(op.amount);
            doctorsDict[op.doctor].tariffs += op.tariffCost;
            doctorsDict[op.doctor].netContribution += op.netUtility;
        });
        const doctorsList = Object.values(doctorsDict).sort((a, b) => b.netContribution - a.netContribution);

        // D. Top Treatments
        const treatmentsDict: Record<string, any> = {};
        processedOps.forEach(op => {
            const name = op.treatment_name || op.description;
            if (!treatmentsDict[name]) {
                treatmentsDict[name] = { name, count: 0, price: 0, tariff: 0, supplies: 0, utility: 0 };
            }
            treatmentsDict[name].count += 1;
            treatmentsDict[name].price += Number(op.amount); // Accumulate total revenue for avg later? Or just sum
            treatmentsDict[name].tariff += op.tariffCost;
            treatmentsDict[name].supplies += op.suppliesCost;
            treatmentsDict[name].utility += op.netUtility;
        });
        const treatmentsList = Object.values(treatmentsDict)
            .map(t => ({
                ...t,
                avgUtility: t.utility / t.count,
                marginPercent: (t.utility / t.price) * 100
            }))
            .sort((a, b) => b.utility - a.utility);

        return {
            summary: {
                totalBilling,
                totalTariffs,
                totalSupplies,
                totalUtility,
                hourlyUtility: totalUtility / (chairsList.reduce((s, c) => s + c.hours, 0) || 1)
            },
            chairs: chairsList,
            doctors: doctorsList,
            treatments: treatmentsList,
            raw: processedOps
        };
    },

    // --- Metas / Goals Engine 🎯 ---


    async getGoalsAnalytics() {
        console.log('Calculating interactions for Metas...');

        // 1. GET REAL DATA (Reuse Production Engine)
        const productionData = await this.getProductionAnalytics();

        // 2. GET GOALS FROM DB
        let goalsMap: any = {
            BILLING: { MONTHLY: 30000, WEEKLY: 7500, DAILY: 1200 },
            NET_UTILITY: { MONTHLY: 12000, MARGIN_PERCENT: 40 },
            EFFICIENCY: { HOURLY_UTILITY: 150, CANCELATION_MAX: 8 },
            CHAIR: { DAILY_REVENUE: 400 },
            DOCTOR: { MIN_NET_CONTRIBUTION: 2000 }
        };

        try {
            const { data: dbGoals } = await supabase.from('vf_goals').select('*');
            if (dbGoals && dbGoals.length > 0) {
                // Merge DB goals into the map
                dbGoals.forEach(g => {
                    if (!goalsMap[g.category]) goalsMap[g.category] = {};
                    goalsMap[g.category][g.metric] = Number(g.target_value);
                });
            }
        } catch (e) {
            console.error("Error fetching goals, using defaults", e);
        }

        const GOALS = goalsMap;

        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysPassed = Math.max(1, now.getDate());

        // 3. CALCULATE METRICS

        // A. Billing & Utility
        const currentBilling = productionData.summary.totalBilling;
        const currentUtility = productionData.summary.totalUtility;

        const projectedBilling = (currentBilling / daysPassed) * daysInMonth;
        const projectedUtility = (currentUtility / daysPassed) * daysInMonth;

        const billingGap = projectedBilling - GOALS.BILLING.MONTHLY;
        const utilityGap = projectedUtility - GOALS.NET_UTILITY.MONTHLY;

        // B. Cancellations (Mocked for now)
        // let cancellationRate = 5.2;

        // C. Efficiency
        const hourlyUtility = productionData.summary.hourlyUtility;

        // 4. ALERTS ENGINE 🚨
        const alerts = [];

        // Alert: Billing
        if (projectedBilling < GOALS.BILLING.MONTHLY) {
            alerts.push({
                type: 'critical',
                title: 'Meta de Facturación en Riesgo',
                message: `Al ritmo actual, cerrarás con $${projectedBilling.toLocaleString()} (Faltan $${Math.abs(billingGap).toLocaleString()}).`
            });
        }

        // Alert: Utility
        if (projectedUtility < GOALS.NET_UTILITY.MONTHLY) {
            alerts.push({
                type: 'warning',
                title: 'Utilidad Neta Baja',
                message: `La rentabilidad proyectada es inferior a la meta.`
            });
        }

        // Alert: Chairs
        const lowPerformingChairs = productionData.chairs
            .filter((c: any) => (c.billing / (c.count || 1)) < GOALS.CHAIR.DAILY_REVENUE) // Approx daily logic
            .map((c: any) => c.name);

        if (lowPerformingChairs.length > 0) {
            alerts.push({
                type: 'info',
                title: 'Sillones con Baja Producción',
                message: `${lowPerformingChairs.join(', ')} están debajo de la meta diaria de $${GOALS.CHAIR.DAILY_REVENUE}.`
            });
        }

        return {
            goals: GOALS,
            actual: {
                billing: {
                    month: currentBilling,
                    projected: projectedBilling,
                    gap: billingGap,
                    percent: (currentBilling / GOALS.BILLING.MONTHLY) * 100
                },
                expenses: {
                    month: currentBilling - currentUtility,
                    ratio: ((currentBilling - currentUtility) / (currentBilling || 1)) * 100
                },
                utility: {
                    month: currentUtility,
                    projected: projectedUtility,
                    gap: utilityGap,
                    percent: (currentUtility / GOALS.NET_UTILITY.MONTHLY) * 100
                },
                efficiency: {
                    hourly: hourlyUtility,
                    cancellationRate: 14 // Mocked
                }
            },
            details: {
                chairs: productionData.chairs.map((c: any) => ({
                    ...c,
                    goalStatus: (c.billing / Math.max(1, daysPassed)) >= GOALS.CHAIR.DAILY_REVENUE ? 'ok' : 'low'
                })),
                doctors: productionData.doctors.map((d: any) => ({
                    ...d,
                    goalStatus: d.netContribution >= GOALS.DOCTOR.MIN_NET_CONTRIBUTION ? 'ok' : 'low'
                })),
                treatments: productionData.treatments.slice(0, 5) // Top 5 Treatments
            },
            alerts
        };
    },

    async updateGoals(newGoals: any) {
        // newGoals is { BILLING: { MONTHLY: 30000 }, ... }
        // We need to flatten and upsert
        // const updates = [];

        for (const category in newGoals) {
            for (const metric in newGoals[category]) {
                const { error } = await supabase
                    .from('vf_goals')
                    .upsert({
                        category,
                        metric,
                        target_value: newGoals[category][metric]
                    }, { onConflict: 'category, metric' });

                if (error) console.error('Error updating goal', error);
            }
        }
        return true;
    },

    // --- AI Context Aggregator 🧠 ---
    // --- SRI Auditor Engine 🕵️‍♂️ ---
    async getTaxAuditorAnalytics() {
        console.log('Running Tax Audit...');
        const [dashboard, transactions] = await Promise.all([
            this.getDashboardMetrics(),
            this.getTransactions()
        ]);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // 1. FILTER CONFIRMED INCOME VS PRODUCTION
        // Simulation: "Production" is all income transactions. "Facturation" is those with 'payment_code' or 'status'='facturado'.
        // Real-world: You'd compare clinical logs vs finance logs.

        const incomeTx = transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === currentYear);
        const totalProduction = incomeTx.reduce((sum, t) => sum + Number(t.amount), 0);

        // Simulating "Invoiced" amount (Assume 85% is invoiced for this demo unless marked)
        // If we had a 'has_invoice' field we would use it. We will use 'payment_code' existence as proxy for now.
        const invoicedTx = incomeTx.filter(t => t.payment_code && t.payment_code !== '-');
        const totalInvoiced = invoicedTx.reduce((sum, t) => sum + Number(t.amount), 0);

        // Gap (Risk)
        const subInvoicingGap = totalProduction - totalInvoiced;
        const subInvoicingPercent = (subInvoicingGap / (totalProduction || 1)) * 100;

        // 2. EXPENSE CLASSIFICATION (Deductible vs Non-Deductible)
        const expenseTx = transactions.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === currentYear);
        const totalExpenses = expenseTx.reduce((sum, t) => sum + Number(t.amount), 0);

        // Assumption: Categories 'Personal', 'Otros', 'No Deducible' are non-deductible.
        const nonDeductibleCategories = ['Personal', 'Otros', 'No Deducible', 'Gustos'];

        const deductibleExpenses = expenseTx
            .filter(t => !nonDeductibleCategories.includes(t.category || '') && !nonDeductibleCategories.includes(t.category_name || ''))
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const nonDeductibleExpenses = totalExpenses - deductibleExpenses;

        // 3. TAXABLE BASE & RENTA ESTIMATION
        const taxableBase = totalProduction - deductibleExpenses; // Base Imponible Global

        // Estimación Renta (Tabla 2024 aprox o RIMPE)
        // RIMPE Negocio Popular: $0 a $60 (Fijo)
        // RIMPE Emprendedor: 1% a 2% sobre INGRESOS BRUTOS (No utilidad)
        // REGIMEN GENERAL: Tabla progresiva (5% a 37%) sobre UTILIDAD

        // Hybrid Estimation for Safety (Conservative): 
        // Use 2% of Gross Income (RIMPE assumption mostly for clinics) OR 20% of Utility (General)
        // Let's use General Regime approx for "Auditor" seriousness: ~22% effective on utility if high, or RIMPE logic.
        // User asked for "Ingresos - Costos = Base". This implies General Regime logic.

        const estimatedRenta = taxableBase > 0 ? taxableBase * 0.20 : 0; // Flat 20% estimation close to corp rate

        // 4. ALERTS
        const alerts = [];

        if (subInvoicingPercent > 15) {
            alerts.push({
                level: 'critical',
                title: 'Alto Riesgo de Subfacturación',
                message: `El ${subInvoicingPercent.toFixed(1)}% de tus ingresos no tiene respaldo de factura detectado.`
            });
        }

        if (nonDeductibleExpenses > (totalExpenses * 0.20)) {
            alerts.push({
                level: 'warning',
                title: 'Gastos No Deducibles Elevados',
                message: `El ${(nonDeductibleExpenses / totalExpenses * 100).toFixed(1)}% de tus gastos no sirve para bajar impuestos.`
            });
        }

        return {
            summary: {
                totalProduction,     // Ingreso Real
                totalInvoiced,       // Ingreso Fiscal
                subInvoicingGap,
                riskLevel: subInvoicingPercent > 20 ? 'Alto' : subInvoicingPercent > 5 ? 'Medio' : 'Bajo',

                totalExpenses,
                deductibleExpenses,
                nonDeductibleExpenses,

                taxableBase,
                estimatedRenta
            },
            alerts
        };
    },

    async getAiContext() {
        console.log('Gathering full AI context from all tables...');

        const [
            goals,
            production,
            transactions,
            patients,
            treatments
        ] = await Promise.all([
            this.getGoalsAnalytics(),
            this.getProductionAnalytics(),
            this.getRecentTransactions(15), // Detailed recent history
            this.getPatients(),
            this.getAranceles()
        ]);

        return {
            goals,
            production,
            transactions,
            patients: patients.slice(0, 20), // Top 20 recent patients
            treatments: treatments.slice(0, 20) // Top 20 treatments
        };
    }
};
