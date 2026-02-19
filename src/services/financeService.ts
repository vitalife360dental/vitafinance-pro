import { supabase } from '../lib/supabase';

export interface Transaction {
    id: string | number;
    amount: number;
    description?: string;
    date: string;
    category_id?: number;
    category_name?: string;
    type: 'income' | 'expense';
    chair?: string;

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
    invoice_number?: string;

    // Computed/Display Fields
    category?: string;
    concept?: string;
    displayDate?: string;
    daysCounter?: number;

    created_at?: string;
    source?: string; // To distinguish between VitaFinance (local) and DentalFlow (external)
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
                invoice_number: t.invoice_number || '-',
                issuer_ruc: t.issuer_ruc || '-',
                issuer_name: t.issuer_name || '-',
                source: 'VitaFinance'
            };
        });

        // Map External (Income from transactions)
        const mappedExternal = externalData.map(t => {

            // Amount
            const amount = Number(t.amount || 0);

            // Date Parsing
            // Handle different date formats (Supabase ISO vs potential local strings)
            const rawDate = t.date || t.created_at || new Date().toISOString();
            const dateObj = new Date(rawDate);

            // Fallback if invalid date
            const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

            const dateStr = validDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeStr = validDate.toTimeString().slice(0, 5); // HH:MM


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
            // Sort by date descending
            const dateA = new Date(a.date).getTime(); // Use 'date' property which is standardized to YYYY-MM-DD or ISO
            const dateB = new Date(b.date).getTime();
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
            issuer_name: transaction.issuer_name,
            invoice_number: transaction.invoice_number
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
                issuer_name: updates.issuer_name,
                invoice_number: updates.invoice_number
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
                // Commission is now calculated dynamically per-doctor
                commission: price * 0.33, // Default display (overridden per-doctor in production)
                doctor_commission: price * 0.33, // Default display
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

    async getFinancialHistory(months = 6) {
        // MOCK DATA GENERATOR
        // In a real scenario, we would run a SQL aggregation by month.
        // For now, to show the chart immediately, we generate realistic trends.
        const history = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('es-ES', { month: 'short' });

            // Base values + Random variation to look natural
            // Trend: Slight growth over time
            const growthFactor = 1 + ((months - i) * 0.05);
            const baseIncome = 28000 * growthFactor;
            const baseExpense = 14000 * growthFactor;

            const randomIncome = baseIncome + (Math.random() * 4000 - 2000);
            const randomExpense = baseExpense + (Math.random() * 2000 - 1000);

            history.push({
                month: monthName.charAt(0).toUpperCase() + monthName.slice(1), // Capitalize
                income: Math.round(randomIncome),
                expenses: Math.round(randomExpense)
            });
        }
        return history;
    },

    // --- Production Analytics Engine 🏭 ---
    async getProductionAnalytics() {
        // 1. Fetch Base Data + Doctor Commission Rules + Clinic Config
        const [transactions, treatments, commissionRules, treatmentCosts, clinicConfig] = await Promise.all([
            this.getTransactions(),
            this.getAranceles(),
            this.getDoctorCommissions(),
            supabase.from('vf_treatment_costs').select('*'),
            this.getClinicConfig()
        ]);

        const normalize = (str: string) =>
            str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

        // Build mapping for special treatment costs (Lab costs)
        const costMap: Record<string, any> = {};
        (treatmentCosts.data || []).forEach((c: any) => {
            if (c.treatment_name) {
                costMap[normalize(c.treatment_name)] = c;
            }
        });

        // Build cascading commission lookup: doctor+category > doctor+_default > 33%
        // Key format: "doctorname::category" or "doctorname::_default"
        const commissionMap: Record<string, number> = {};
        commissionRules.forEach((rule: any) => {
            const doctorName = rule.name || rule.doctor_name || '';
            const category = rule.category || '_default';
            const key = `${normalize(doctorName)}::${normalize(category)}`;
            commissionMap[key] = Number(rule.commission_rate) / 100;
        });

        const getCommissionRate = (doctorName: string, treatmentCategory: string, treatmentName: string): number => {
            const docKey = normalize(doctorName);
            const treatKey = normalize(treatmentName);
            const catKey = normalize(treatmentCategory);

            // 1. Try doctor + specific treatment name
            const treatmentSpecKey = `${docKey}::${treatKey}`;
            if (commissionMap[treatmentSpecKey] !== undefined) return commissionMap[treatmentSpecKey];

            // 2. Try doctor + specific category (legacy/fallback)
            const specificKey = `${docKey}::${catKey}`;
            if (commissionMap[specificKey] !== undefined) return commissionMap[specificKey];

            // 3. Try doctor + _default
            const defaultKey = `${docKey}::_default`;
            if (commissionMap[defaultKey] !== undefined) return commissionMap[defaultKey];

            // 4. Global fallback
            return 0.33;
        };

        // Linked Map as per Insumos Logic
        const NAME_MAPPING: Record<string, string> = {
            'corona circonia': 'corona zirconia',
            'botox perioral': 'botox peribucal',
            'cirugia 3er molares': 'cirugia 3ros molares',
            'puente fijo 3 piezas hibrida': 'puente fijo 3 piezas',
            'puente de ceromero 2 piezas': 'puente ceromero 2 piezas',
            'retratamiento premolares': 'retratamiento molares',
            'endodoncia en diente incisivo': 'endodoncia incisivo',
            'diseno de ceramica (8 piezas)': 'diseno de ceramica',
            'diseño de ceramica (8 piezas)': 'diseno de ceramica',
            'diseno de sonrisa (8 piezas)': 'diseno de sonrisa',
            'diseño de sonrisa (8 piezas)': 'diseno de sonrisa',
            'elevacion piso seno': 'elevacion piso de seno',
            'instalacion de plano de mordida': 'instalacion plano de mordida',
            'plano relajacion': 'plano de relajacion'
        };

        // 2. Filter for Income (Production)
        const incomeTx = transactions.filter(t => t.type === 'income');

        // 3. Process each transaction with PER-DOCTOR + PER-CATEGORY commission
        const processedOps = incomeTx.map(tx => {
            const doctorName = tx.doctor_name || 'Dr. General';

            // Find relevant tariff/arancel based on treatment name
            let searchName = normalize(tx.treatment_name || tx.description);
            if (NAME_MAPPING[searchName]) {
                searchName = normalize(NAME_MAPPING[searchName]);
            }

            const relatedTreatment = treatments.find(t => {
                const tName = normalize(t.name);
                return tName === searchName || searchName.includes(tName);
            });

            // Get the treatment's category for commission resolution
            const treatmentCategory = relatedTreatment?.category || 'General';

            // Use matched treatment name for more robust rule lookup
            const lookupName = relatedTreatment?.name || tx.treatment_name || tx.description || 'Consulta';
            const commissionRate = getCommissionRate(doctorName, treatmentCategory, lookupName);

            // Special Costs Deduction (Lab costs) - Priority: Match by normalization
            const treatmentCostData = costMap[normalize(lookupName)] || {};
            const labCost = Number(treatmentCostData.lab_cost || 0);

            // Arancel: commission on FULL billed amount (lab cost only affects net utility)
            const tariffCost = Number(tx.amount) * commissionRate;

            // Estimated Supplies (Materiales) - Rule of thumb: 15% 
            // Usually clinic supplies are separate from external lab costs.
            const suppliesCost = Number(tx.amount) * 0.15;

            // Operational Cost (Costo Sillón)
            // Calculate dynamically from clinic config
            const fixedCosts = Number(clinicConfig?.FIXED_COSTS_MONTHLY) || 0;
            const hoursMonthly = Number(clinicConfig?.OPERATIONAL_HOURS_MONTHLY) || 160;
            const calculatedCostPerMinute = fixedCosts / (hoursMonthly * 60);

            // Use calculated or fallback to $0.33 (approx $3100/mo)
            const costPerMinute = calculatedCostPerMinute > 0 ? calculatedCostPerMinute : 0.33;
            const duration = 30; // Default or fetch real duration
            const operationalCost = duration * costPerMinute;

            const netUtility = Math.max(0, Number(tx.amount) - tariffCost - suppliesCost - labCost - operationalCost);

            return {
                ...tx,
                tariffCost,
                suppliesCost,
                operationalCost,
                netUtility,
                commissionRate, // Attach rate for UI display
                treatmentCategory, // Attach category for transparency
                chair: tx.chair || 'Sillón Indefinido',
                doctor: doctorName
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

        const doctorsDict: Record<string, any> = {};
        processedOps.forEach(op => {
            // FILTER: Only include PAID transactions for Doctor Performance & Commission Calculation
            // User requested: "solo los pagos que sean en el estado cancelado"
            const status = normalize(op.status || '');
            const isPaid = status === 'cancelado' || status === 'completado' || status === 'pagado';

            if (!isPaid) return;

            if (!doctorsDict[op.doctor]) {
                doctorsDict[op.doctor] = {
                    name: op.doctor,
                    attentions: 0,
                    billing: 0,
                    tariffs: 0,
                    operationalCost: 0,
                    netContribution: 0,
                    commissionRate: op.commissionRate, // Store the rate for display
                    ops: [] // Store individual operations for breakdown
                };
            }
            doctorsDict[op.doctor].attentions += 1;
            doctorsDict[op.doctor].billing += Number(op.amount);
            doctorsDict[op.doctor].tariffs += op.tariffCost;
            doctorsDict[op.doctor].operationalCost += op.operationalCost;
            doctorsDict[op.doctor].netContribution += op.netUtility; // This already has opCost deducted in map step
            doctorsDict[op.doctor].ops.push({
                id: op.id,
                date: op.date,
                patient: op.patient_name || 'Paciente General',
                treatment: op.treatment_name || op.description,
                category: op.treatmentCategory,
                amount: Number(op.amount),
                commissionRate: op.commissionRate,
                commissionAmount: op.tariffCost,
                operationalCost: op.operationalCost
            });
        });
        const doctorsList = Object.values(doctorsDict).map(d => ({
            ...d,
            netContribution: d.billing - d.tariffs - d.operationalCost // Recalculate net after op cost
        })).sort((a, b) => b.netContribution - a.netContribution);

        // D. Top Treatments
        const treatmentsDict: Record<string, any> = {};
        processedOps.forEach(op => {
            const name = op.treatment_name || op.description;
            if (!treatmentsDict[name]) {
                treatmentsDict[name] = { name, count: 0, price: 0, tariff: 0, supplies: 0, operationalCost: 0, utility: 0 };
            }
            treatmentsDict[name].count += 1;
            treatmentsDict[name].price += Number(op.amount);
            treatmentsDict[name].tariff += op.tariffCost;
            treatmentsDict[name].supplies += op.suppliesCost;
            treatmentsDict[name].operationalCost += op.operationalCost;

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

    // --- ADVANCED COSTING (INSUMOS) 🧪 ---

    async getClinicConfig() {
        const { data } = await supabase.from('vf_clinic_config').select('*');
        // Default Config in case DB is empty or fails
        const config: any = {
            FIXED_COSTS_MONTHLY: 1500,
            OPERATIONAL_HOURS_MONTHLY: 160,
            COST_RENT: 0,
            COST_ELECTRICITY: 0,
            COST_WATER: 0,
            COST_INTERNET: 0,
            COST_SALARIES: 0,
            COST_OTHER: 0
        };

        if (data) {
            data.forEach((row: any) => {
                // Ensure we handle numeric conversion safely
                if (row.value) config[row.key] = Number(row.value);
            });
        }
        return config;
    },

    async saveClinicConfig(config: any) {
        // Transform the flat config object into Key-Value rows for the DB
        const rows = Object.entries(config).map(([key, value]) => ({
            key: key,
            value: String(value), // Store as text in DB as per likely schema, or handled by current schema
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('vf_clinic_config')
            .upsert(rows, { onConflict: 'key' });

        if (error) {
            console.error("Error saving config:", error);
            throw error;
        }
    },

    async generateOperationalExpenses(config: any) {
        console.log('Generating Egresos from Operational Config...');
        const today = new Date().toISOString().split('T')[0];

        // Map config keys to readable descriptions and potential categories
        const COST_MAPPING: Record<string, string> = {
            'COST_RENT': 'Alquiler Consultorio',
            'COST_SALARIES': 'Sueldos Fijos / Nómina',
            'COST_ELECTRICITY': 'Servicio Básico: Electricidad',
            'COST_WATER': 'Servicio Básico: Agua',
            'COST_INTERNET': 'Servicio: Internet/Teléfono',
            'COST_OTHER': 'Otros Gastos Operativos'
        };

        const expensesToCreate = [];

        for (const [key, value] of Object.entries(config)) {
            // Only process known cost keys with value > 0
            if (COST_MAPPING[key] && Number(value) > 0) {
                expensesToCreate.push({
                    amount: Number(value),
                    description: `Costo Operativo: ${COST_MAPPING[key]}`,
                    date: today,
                    type: 'expense' as const,
                    category_id: undefined, // Will default to General or we could fetch 'Costos Operativos' category,
                    payment_code: '-',
                    method: 'Transferencia', // Default assumption for fixed costs
                    status: 'PAGADO'
                });
            }
        }

        if (expensesToCreate.length === 0) return 0;

        // Execute creations cleanly
        let createdCount = 0;
        for (const expense of expensesToCreate) {
            try {
                // Use existing createTransaction to handle all DB defaults
                await this.createTransaction({
                    ...expense,
                    // Fill required missing fields
                    patient_name: '-',
                    doctor_name: '-',
                    treatment_name: expense.description, // Use description as 'treatment' for visibility in some views
                    transaction_time: new Date().toTimeString().slice(0, 5)
                });
                createdCount++;
            } catch (e) {
                console.error(`Failed to create expense for ${expense.description}`, e);
            }
        }

        return createdCount;
    },

    async getSupplyAnalysis() {
        console.log('Calculating True Profitability...');

        // Helper for robust matching (removes accents, lowercase, trim)
        const normalize = (str: string) =>
            str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

        // Link External App Names (Keys) to Our DB Standard Names (Values)
        const NAME_MAPPING: Record<string, string> = {
            'corona circonia': 'corona zirconia',
            'botox perioral': 'botox peribucal',
            'cirugia 3er molares': 'cirugia 3ros molares',
            'puente fijo 3 piezas hibrida': 'puente fijo 3 piezas',
            'puente de ceromero 2 piezas': 'puente ceromero 2 piezas',
            'retratamiento premolares': 'retratamiento molares', // Best guess mapping
            'endodoncia en diente incisivo': 'endodoncia incisivo',
            'diseno de ceramica (8 piezas)': 'diseno de ceramica',
            'diseño de ceramica (8 piezas)': 'diseno de ceramica',
            'diseno de sonrisa (8 piezas)': 'diseno de sonrisa',
            'diseño de sonrisa (8 piezas)': 'diseno de sonrisa',
            'elevacion piso seno': 'elevacion piso de seno',
            'instalacion de plano de mordida': 'instalacion plano de mordida',
            'plano relajacion': 'plano de relajacion'
        };

        // 1. Fetch External Treatments, Costs, Commission Rules, AND real Transactions
        const [treatments, costsResult, commissionRules, transactions] = await Promise.all([
            this.getAranceles(),
            supabase.from('vf_treatment_costs').select('*'),
            this.getDoctorCommissions(),
            this.getTransactions()
        ]);

        // 2. Build cost map
        const costMap = new Map();
        costsResult.data?.forEach((c: any) => {
            if (c.treatment_name) {
                const key = normalize(c.treatment_name);
                costMap.set(key, c);
            }
        });

        // 3. Build commission lookup (same logic as getProductionAnalytics)
        const commissionMap: Record<string, number> = {};
        commissionRules.forEach((rule: any) => {
            const doctorName = rule.name || rule.doctor_name || '';
            const category = rule.category || '_default';
            const key = `${normalize(doctorName)}::${normalize(category)}`;
            commissionMap[key] = Number(rule.commission_rate) / 100;
        });

        const getCommissionRate = (doctorName: string, treatmentCategory: string, treatmentName: string): number => {
            const docKey = normalize(doctorName);
            const treatKey = normalize(treatmentName);
            const catKey = normalize(treatmentCategory);
            const treatmentSpecKey = `${docKey}::${treatKey}`;
            if (commissionMap[treatmentSpecKey] !== undefined) return commissionMap[treatmentSpecKey];
            const specificKey = `${docKey}::${catKey}`;
            if (commissionMap[specificKey] !== undefined) return commissionMap[specificKey];
            const defaultKey = `${docKey}::_default`;
            if (commissionMap[defaultKey] !== undefined) return commissionMap[defaultKey];
            return 0.33;
        };

        // 4. Calculate weighted average commission rate per treatment from real transactions
        const incomeTx = transactions.filter((t: any) => t.type === 'income');
        const treatmentRateAgg: Record<string, { totalAmount: number; weightedRateSum: number }> = {};

        incomeTx.forEach((tx: any) => {
            const doctorName = tx.doctor_name || 'Dr. General';
            let txTreatName = normalize(tx.treatment_name || tx.description || '');
            if (NAME_MAPPING[txTreatName]) txTreatName = normalize(NAME_MAPPING[txTreatName]);

            // Find the matching treatment to get category
            const relatedTreatment = treatments.find((t: any) => {
                const tName = normalize(t.name);
                return tName === txTreatName || txTreatName.includes(tName);
            });
            const treatmentCategory = relatedTreatment?.category || 'General';
            const lookupName = relatedTreatment?.name || tx.treatment_name || tx.description || 'Consulta';

            const rate = getCommissionRate(doctorName, treatmentCategory, lookupName);
            const amount = Number(tx.amount);
            const key = normalize(lookupName);

            if (!treatmentRateAgg[key]) treatmentRateAgg[key] = { totalAmount: 0, weightedRateSum: 0 };
            treatmentRateAgg[key].totalAmount += amount;
            treatmentRateAgg[key].weightedRateSum += amount * rate;
        });

        // Build final map: treatment name -> weighted average rate
        const treatmentAvgRates: Record<string, number> = {};
        for (const [key, agg] of Object.entries(treatmentRateAgg)) {
            treatmentAvgRates[key] = agg.totalAmount > 0 ? (agg.weightedRateSum / agg.totalAmount) : 0.33;
        }

        // 5. Fetch Clinic Config
        const config = await this.getClinicConfig();
        const fixedCosts = config.FIXED_COSTS_MONTHLY || 1500;
        const opHours = config.OPERATIONAL_HOURS_MONTHLY || 160;
        const costPerMinute = fixedCosts / (opHours * 60);

        // 6. Merge & Calculate
        const analysis = treatments.map(t => {
            // Normalize external name 
            let searchName = normalize(t.name);

            // Level 1: Check Manual Mapping
            if (NAME_MAPPING[searchName]) {
                searchName = normalize(NAME_MAPPING[searchName]);
            }

            // Level 2: Direct or Fuzzy Match
            let localCost = costMap.get(searchName);

            // Level 3: Partial Match Smart Logic (if no direct match)
            if (!localCost) {
                for (const dbKey of costMap.keys()) {
                    if (dbKey.length > 4 && searchName.includes(dbKey)) {
                        localCost = costMap.get(dbKey);
                        break;
                    }
                }
            }

            localCost = localCost || {};

            // If duration is missing in external, try local override, else default 30
            const finalDuration = t.duration ? parseInt(t.duration) : (localCost.duration_override || 30);

            // Costs
            const labCost = Number(localCost.lab_cost || 0);
            const supplyCost = Number(localCost.supply_cost || 0);
            const overheadCost = finalDuration * costPerMinute;

            // Commission: on FULL price, using weighted avg rate from real transactions (fallback 33%)
            const avgRate = treatmentAvgRates[searchName] ?? 0.33;
            const commission = t.price * avgRate;

            // Gross Margin: Precio - Materiales - Lab (NO arancel, NO overhead)
            const directCosts = supplyCost + labCost;
            const grossMargin = t.price - directCosts;
            const grossMarginPct = t.price > 0 ? (grossMargin / t.price) * 100 : 0;

            // Full Profit (for Pagos/Producción views)
            const totalCost = commission + supplyCost + labCost + overheadCost;
            const netProfit = t.price - totalCost;
            const margin = t.price > 0 ? (netProfit / t.price) * 100 : 0;

            // Status Color (based on gross margin now)
            let profitabilityStatus = 'good'; // Green
            if (grossMarginPct < 30) profitabilityStatus = 'critical'; // Red
            else if (grossMarginPct < 60) profitabilityStatus = 'warning'; // Yellow

            return {
                ...t,
                doctor_commission: commission,
                avgCommissionRate: avgRate,
                finalDuration,
                supplyCost,
                labCost,
                overheadCost,
                directCosts,
                grossMargin,
                grossMarginPct,
                totalCost,
                netProfit,
                margin,
                profitabilityStatus,
                categoryGroup: localCost.category_group || 'General'
            };
        });

        return {
            items: analysis,
            config: {
                ...config,
                costPerMinute
            }
        };
    },

    async updateTreatmentCost(treatmentName: string, newValue: number, type: 'supply' | 'lab' = 'supply') {
        // 1. Check if a row already exists (to preserve its category_group)
        const { data: existing } = await supabase
            .from('vf_treatment_costs')
            .select('category_group, supply_cost, lab_cost')
            .eq('treatment_name', treatmentName)
            .maybeSingle();

        const updateData: any = {
            treatment_name: treatmentName,
            category_group: existing?.category_group || 'General',
            supply_cost: existing?.supply_cost ?? 0,
            lab_cost: existing?.lab_cost ?? 0,
            updated_at: new Date().toISOString()
        };

        // Override the specific field being edited
        if (type === 'lab') {
            updateData.lab_cost = newValue;
        } else {
            updateData.supply_cost = newValue;
        }

        const { error } = await supabase
            .from('vf_treatment_costs')
            .upsert(updateData, { onConflict: 'treatment_name' });

        if (error) {
            console.error('Error updating cost:', error);
            return false;
        }
        return true;
    },

    async initializeDefaultCosts() {
        console.log("Initializing default costs...");
        // UPDATED: Uppercase NO ACCENTS to match typical External App data (e.g. APICECTOMIA)
        const DEFAULT_COSTS = [
            { name: 'PROFILAXIS', cost: 2.50, group: '🟢 PREVENTIVO' },
            { name: 'PROFILAXIS NINOS', cost: 2.00, group: '🟢 PREVENTIVO' },
            { name: 'PROFILAXIS NIÑOS', cost: 2.00, group: '🟢 PREVENTIVO' }, // Keep both just in case
            { name: 'SELLANTES', cost: 2.20, group: '🟢 PREVENTIVO' },
            { name: 'BLANQUEAMIENTO', cost: 25.00, group: '🔶 ESTÉTICA' },
            { name: 'RESTAURACION SIMPLE', cost: 3.00, group: '🟡 RESTAURATIVO' },
            { name: 'RESTAURACION COMPUESTA', cost: 4.00, group: '🟡 RESTAURATIVO' },
            { name: 'RESTAURACION COMPLEJA', cost: 5.50, group: '🟡 RESTAURATIVO' },
            { name: 'BLANQUEAMIENTO AMBULATORIO', cost: 15.00, group: '🔶 ESTÉTICA' },
            { name: 'RESTAURACION RECONSTRUCTIVA', cost: 6.00, group: '🟡 RESTAURATIVO' },
            { name: 'RESTAURACION DE CUELLOS', cost: 3.00, group: '🟡 RESTAURATIVO' },
            { name: 'PULPOTOMIA', cost: 6.00, group: '🟢 PREVENTIVO' },
            { name: 'PULPECTOMIA', cost: 8.00, group: '🟢 PREVENTIVO' },
            { name: 'INSTALACION ORTODONCIA ORTOMETRIC', cost: 35.00, group: '🟣 ORTODONCIA' },
            { name: 'INSTALACION AUTOLIGADOS', cost: 45.00, group: '🟣 ORTODONCIA' },
            { name: 'INSTALACION CONVENCIONALES', cost: 40.00, group: '🟣 ORTODONCIA' },
            { name: 'CONTROL AUTOLIGADOS', cost: 3.00, group: '🟣 ORTODONCIA' },
            { name: 'CONTROL ORTOMETRIC', cost: 3.00, group: '🟣 ORTODONCIA' },
            { name: 'CONTROL CONVENCIONAL', cost: 2.50, group: '🟣 ORTODONCIA' },
            { name: 'INSTALACION DE MICROTORNILLO', cost: 25.00, group: '🟣 ORTODONCIA' },
            { name: 'APICECTOMIA', cost: 18.00, group: '🔵 ENDODONCIA' },
            { name: 'ELEVACION PISO DE SENO', cost: 180.00, group: '🔴 CIRUGÍA' },
            { name: 'EXODONCIA', cost: 3.00, group: '🔴 CIRUGÍA' },
            { name: 'INSTALACION PLANO DE MORDIDA', cost: 18.00, group: '🟣 ORTODONCIA' },
            { name: 'MUCOCELE', cost: 6.00, group: '🟢 PREVENTIVO' },
            { name: 'RETENEDORES ACETATO', cost: 20.00, group: '🟣 ORTODONCIA' },
            { name: 'RETENEDORES ACRILICOS', cost: 30.00, group: '🟣 ORTODONCIA' },
            { name: 'CIRUGIA 3ROS MOLARES', cost: 10.00, group: '🔴 CIRUGÍA' },
            { name: 'CARILLA RESINA (x pieza)', cost: 6.00, group: '🔶 ESTÉTICA' },
            { name: 'FRENILECTOMIA', cost: 5.00, group: '🔶 ESTÉTICA' },
            { name: 'CARILLA PORCELANA', cost: 60.00, group: '🔶 ESTÉTICA' },
            { name: 'DISENO DE SONRISA', cost: 120.00, group: '🔶 ESTÉTICA' },
            { name: 'DISEÑO DE SONRISA', cost: 120.00, group: '🔶 ESTÉTICA' },
            { name: 'BORDES INCISALES', cost: 5.00, group: '🔶 ESTÉTICA' },
            { name: 'DISENO DE CERAMICA', cost: 600.00, group: '🔶 ESTÉTICA' },
            { name: 'DISEÑO DE CERÁMICA', cost: 600.00, group: '🔶 ESTÉTICA' },
            { name: 'GINGIVECTOMIA', cost: 6.00, group: '🔶 ESTÉTICA' },
            { name: 'CIRUGIA COMPLEJA', cost: 12.00, group: '🔴 CIRUGÍA' },
            { name: 'EXTRACCION SIMPLE', cost: 3.00, group: '🔴 CIRUGÍA' },
            { name: 'EXTRACCION NINOS', cost: 2.50, group: '🔴 CIRUGÍA' },
            { name: 'EXTRACCION DIENTES', cost: 3.00, group: '🔴 CIRUGÍA' },
            { name: 'CIRUGIA CANINO RETENIDO', cost: 15.00, group: '🔴 CIRUGÍA' },
            { name: 'ENDODONCIA INCISIVO', cost: 18.00, group: '🔵 ENDODONCIA' },
            { name: 'ENDODONCIA PREMOLARES', cost: 20.00, group: '🔵 ENDODONCIA' },
            { name: 'ENDODONCIA MOLARES', cost: 22.00, group: '🔵 ENDODONCIA' },
            { name: 'RETRATAMIENTO DIENTE ANTERIOR', cost: 25.00, group: '🔵 ENDODONCIA' },
            { name: 'RETRATAMIENTO MOLARES', cost: 28.00, group: '🔵 ENDODONCIA' },
            { name: 'RETRATAMIENTO MOLARES COMPLEJO', cost: 30.00, group: '🔵 ENDODONCIA' },
            { name: 'PULPOTOMIA DIENTE PERMANENTE', cost: 7.00, group: '🟢 PREVENTIVO' },
            { name: 'IMPLANTE CIRUGIA', cost: 250.00, group: '🔴 IMPLANTOLOGÍA' },
            { name: 'PROTESIS PROVISIONAL', cost: 10.00, group: '🟠 PRÓTESIS' },
            { name: 'PROTESIS TOTAL', cost: 80.00, group: '🟠 PRÓTESIS' },
            { name: 'PROTESIS PARCIAL', cost: 60.00, group: '🟠 PRÓTESIS' },
            { name: 'PROTESIS ACKER 1 PIEZA', cost: 70.00, group: '🟠 PRÓTESIS' },
            { name: 'PROTESIS CROMO COBALTO', cost: 120.00, group: '🟠 PRÓTESIS' },
            { name: 'PLANO DE RELAJACION', cost: 20.00, group: '🟣 ORTODONCIA' },
            { name: 'PUENTE FIJO 3 PIEZAS', cost: 180.00, group: '🟠 PRÓTESIS' },
            { name: 'CORONA METAL PORCELANA', cost: 70.00, group: '🟠 PRÓTESIS' },
            { name: 'CORONA ZIRCONIA', cost: 120.00, group: '🟠 PRÓTESIS' },
            { name: 'PUENTE ACRILICO 3 PIEZAS', cost: 60.00, group: '🟠 PRÓTESIS' },
            { name: 'PUENTE CEROMERO 2 PIEZAS', cost: 110.00, group: '🟠 PRÓTESIS' },
            { name: 'INCRUSTACION DE CIRCONIO', cost: 90.00, group: '🟠 PRÓTESIS' },
            { name: 'INCRUSTACION CEROMERO', cost: 70.00, group: '🟠 PRÓTESIS' },
            { name: 'POSTE FIBRA DE VIDRIO', cost: 15.00, group: '🔵 ENDODONCIA' },
            { name: 'RECORTE DE ENCIA 1 PIEZA', cost: 2.00, group: '🔶 ESTÉTICA' },
            { name: 'RECORTE DE ENCIA 10 PIEZAS', cost: 8.00, group: '🔶 ESTÉTICA' },
            { name: 'MANTENIMIENTO CARILLAS', cost: 4.00, group: '🔶 ESTÉTICA' },
            { name: 'CORONA SOBRE IMPLANTE', cost: 140.00, group: '🔴 IMPLANTOLOGÍA' },
            { name: 'BOTOX TERCIO SUPERIOR', cost: 90.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'BOTOX PERIBUCAL', cost: 25.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'BOTOX BRUXISMO', cost: 110.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'LABIOS AUMENTO', cost: 110.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'MENTON', cost: 95.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'MANDIBULA', cost: 95.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'SURCO NASOLABIAL', cost: 100.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'NARIZ', cost: 120.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'BIOESTIMULADOR', cost: 180.00, group: '🔶 ESTÉTICA FACIAL' },
            { name: 'CEMENTACION CORONA', cost: 2.00, group: '🟡 RESTAURATIVO' }
        ];

        // Bulk Upsert using Promise.all for parallelism
        // Note: Supabase upsert accepts an array.
        const labTreatments = [
            'IMPLANTE CIRUGIA', 'CORONA ZIRCONIA', 'PUENTE FIJO 3 PIEZAS',
            'PROTESIS TOTAL', 'PROTESIS CROMO COBALTO', 'INCRUSTACION DE CIRCONIO',
            'CARILLA PORCELANA', 'DISENO DE CERAMICA', 'DISEÑO DE CERÁMICA',
            'DISEÑO DE SONRISA', 'DISENO DE SONRISA', 'PUENTE FIJO 3 PIEZAS'
        ];

        const { error } = await supabase
            .from('vf_treatment_costs')
            .upsert(
                DEFAULT_COSTS.map(item => {
                    const normalizedName = item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                    const isLab = labTreatments.includes(normalizedName) || item.group.includes('PRÓTESIS');

                    return {
                        treatment_name: item.name,
                        category_group: item.group,
                        supply_cost: isLab ? 2.50 : item.cost, // Default material overhead for lab items
                        lab_cost: isLab ? item.cost : 0,
                        updated_at: new Date().toISOString()
                    };
                }),
                { onConflict: 'treatment_name' }
            );

        if (error) {
            console.error('Bulk Initialise Error', error);
            return false;
        }
        return true;
    },

    // --- AI Context Aggregator 🧠 ---
    // --- SRI Auditor Engine 🕵️‍♂️ ---
    async getTaxAuditorAnalytics() {
        console.log('Running Tax Audit...');
        const [, transactions] = await Promise.all([
            this.getDashboardMetrics(),
            this.getTransactions()
        ]);


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

        // 5. RISK HISTORY (Mocked for now - or could be real aggregation)
        // "Enero 🟢 Bajo", "Febrero 🟢 Bajo", "Marzo 🟡 Medio"...
        const riskHistory = [
            { month: 'Sep', level: 'Bajo', color: 'emerald' },
            { month: 'Oct', level: 'Bajo', color: 'emerald' },
            { month: 'Nov', level: 'Medio', color: 'amber' },
            { month: 'Dic', level: 'Bajo', color: 'emerald' },
            { month: 'Ene', level: 'Bajo', color: 'emerald' },
            { month: 'Feb', level: 'Bajo', color: 'emerald' }
        ];

        // 6. SMART ALERTS (Informative / Trends)
        const smartAlerts = [
            {
                title: 'Margen Deducible',
                message: 'Tu capacidad de deducir gastos bajó un 8% respecto al mes anterior.',
                type: 'info',
                icon: 'TrendingDown'
            },
            {
                title: 'Gastos Operativos',
                message: 'Se detectó un aumento en gastos no deducibles en la categoría Insumos.',
                type: 'info',
                icon: 'AlertCircle'
            }
        ];

        return {
            summary: {
                totalProduction,     // Ingreso Real
                totalInvoiced,       // Ingreso Fiscal
                subInvoicingGap,
                riskLevel: subInvoicingPercent > 20 ? 'Alto' : subInvoicingPercent > 5 ? 'Medio' : 'Bajo',
                subInvoicingPercent, // Added for UI

                totalExpenses,
                deductibleExpenses,
                nonDeductibleExpenses,

                taxableBase,
                estimatedRenta
            },
            alerts,
            riskHistory,
            smartAlerts
        };
    },

    async getAiContext() {
        console.log('Gathering full AI context from all tables...');

        const [
            goals,
            production,
            transactions,
            patients,
            treatments,
            taxAudit,
            supplyAnalysis,
            financialHistory,
            clinicConfig,
            doctorCommissions
        ] = await Promise.all([
            this.getGoalsAnalytics(),
            this.getProductionAnalytics(),
            this.getRecentTransactions(50), // Detailed recent history (Boosted to 50 for better context)
            this.getPatients(),
            this.getAranceles(),
            this.getTaxAuditorAnalytics(),
            this.getSupplyAnalysis(),
            this.getFinancialHistory(12),
            this.getClinicConfig(),
            this.getDoctorCommissions()
        ]);

        return {
            goals,
            production,
            transactions,
            patients: patients.slice(0, 20), // Top 20 recent patients
            treatments: treatments.slice(0, 50), // Increased to top 50
            taxAudit,
            supplyAnalysis,
            financialHistory,
            clinicConfig,
            doctorCommissions
        };
    },

    // --- Doctor Commission Config (per doctor + category) ---

    async getDoctorCommissions() {
        try {
            const { data, error } = await supabase
                .from('vf_doctors')
                .select('*')
                .order('name');

            if (error) {
                console.warn('vf_doctors table not available:', error.message);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn('Could not fetch doctor commissions:', e);
            return [];
        }
    },

    async upsertDoctorCommission(doctorName: string, category: string, commissionRate: number) {
        // Try with category column first (upgraded schema)
        const { data, error } = await supabase
            .from('vf_doctors')
            .upsert(
                { name: doctorName, category, commission_rate: commissionRate },
                { onConflict: 'name,category' }
            )
            .select()
            .single();

        if (error) {
            // If category column doesn't exist, fall back to simple upsert
            if (error.message?.includes('category') || error.code === 'PGRST204') {
                console.warn('category column not found, using fallback save (name + commission_rate only)');
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('vf_doctors')
                    .upsert(
                        { name: doctorName, commission_rate: commissionRate },
                        { onConflict: 'name' }
                    )
                    .select()
                    .single();

                if (fallbackError) throw fallbackError;
                return fallbackData;
            }
            throw error;
        }
        return data;
    },

    async deleteDoctorCommission(id: string) {
        const { error } = await supabase
            .from('vf_doctors')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async deleteDoctorCommissionByName(doctorName: string, category: string) {
        const { error } = await supabase
            .from('vf_doctors')
            .delete()
            .eq('name', doctorName)
            .eq('category', category);

        if (error) throw error;
        return true;
    }
};
