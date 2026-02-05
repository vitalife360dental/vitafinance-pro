import { supabase } from '../lib/supabase';

export interface Transaction {
    id: number;
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

    async getTransactions() {
        console.log('Fetching financial data (Merged Stream)...');

        // 1. Fetch Local Data (Mostly Expenses created in VitaFinance)
        const { data: localData, error: localError } = await supabase
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

        if (localError) throw localError;

        // 2. Fetch External Data (Income from DentalFlow)
        let externalData: any[] = [];
        try {
            const { data: extDocs, error: extError } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false }) // Assuming created_at or date exists
                .limit(500); // Limit to recent history for performance

            if (!extError && extDocs) {
                externalData = extDocs;
            } else if (extError) {
                console.warn('Could not fetch external transactions (RLS block):', extError.message);
            }
        } catch (err) {
            console.warn('External fetch failed', err);
        }

        // 3. Process & Merge
        // Map Local (Expenses)
        const mappedLocal = localData.map(t => {
            // Calculate days elapsed
            const diffTime = Math.abs(new Date().getTime() - new Date(t.date).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                ...t,
                type: (t.type === 'expense' || t.type === 'EGRESO') ? 'expense' : 'income',
                concept: t.treatment_name || t.description || 'Movimiento Manual',
                category: t.vf_categories?.name || 'General',
                amount: Number(t.amount),
                balance: Number(t.balance || 0),
                displayDate: t.date,
                displayTime: t.transaction_time?.slice(0, 5) || '00:00',

                // New Fields for Exact Replica
                daysCounter: diffDays,
                payment_code: t.payment_code || '-',
                patient_name: t.patient_name || '-',
                treatment_name: t.treatment_name || t.description || '-',
                duration: '-', // expenses usually don't have duration
                doctor_name: t.doctor_name || '-',
                chair: '-',
                method: t.method || 'Efectivo',
                status: t.status || 'CANCELADO',

                source: 'VitaFinance'
            };
        });

        // Map External (Income)
        const mappedExternal = externalData.map(t => {
            const amount = Number(t.amount || t.total || t.precio || 0);
            const dateObj = t.date || t.created_at || new Date().toISOString();
            const dateStr = String(dateObj).split('T')[0];
            const timeStr = t.time || (String(dateObj).includes('T') ? String(dateObj).split('T')[1].slice(0, 5) : '00:00');

            // Calculate days elapsed
            const diffTime = Math.abs(new Date().getTime() - new Date(dateStr).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                id: `EXT-${t.id}`,
                amount: amount,
                description: t.description || t.notes || 'Ingreso DentalFlow',
                date: dateStr,
                type: 'income',
                category_id: null,
                category_name: 'Tratamientos',

                // Mapped Columns
                daysCounter: diffDays,
                displayTime: timeStr,
                payment_code: t.payment_code || t.code || `PAG-${dateStr.replace(/-/g, '')}`,
                patient_name: t.patient_name || t.paciente || 'Paciente General',
                treatment_name: t.treatment_name || t.tratamiento || 'Consulta',
                duration: t.duration ? `${t.duration} min` : '30 min',
                doctor_name: t.provider_name || t.doctor_name || t.doctor || 'Dr. General',
                chair: t.operatory_name || t.chair || t.sillon || 'Sillón 1',
                method: t.method || t.payment_method || 'EFECTIVO',
                status: t.payment_status || t.status || 'CANCELADO', // Use payment_status from specific raw data
                balance: Number(t.balance || 0),

                concept: t.treatment_name || t.description || 'Consulta / Tratamiento',
                category: 'Ingresos Clínicos',
                displayDate: dateStr,
                source: 'DentalFlow'
            };
        });

        // Combine and Sort
        const merged = [...mappedLocal, ...mappedExternal];

        // Sort by Date Descending
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
            issuer_ruc: transaction.issuer_ruc
        };

        const { data, error } = await supabase
            .from('vf_transactions')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTransaction(id: number, updates: Partial<Transaction>) {
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
                issuer_ruc: updates.issuer_ruc
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTransaction(id: number) {
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

        // 1. Try fetching from the master table 'treatments'
        const { data: treatmentsList, error: errorT } = await supabase
            .from('treatments')
            .select('*')
            .limit(100);

        if (!errorT && treatmentsList && treatmentsList.length > 0) {
            return treatmentsList.map((t: any) => ({
                id: t.id,
                name: t.name || t.nombre || t.title || 'Tratamiento',
                price: Number(t.price || t.amount || t.cost || t.precio || 0),
                source: 'DentalFlow'
            }));
        }

        // 2. Fallback: Log error but return empty to show setup hint
        if (errorT) {
            console.warn('Error reading treatments table:', errorT.message);
        }

        return [];
    },

    async createArancel(item: { name: string; price: number }) {
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
    }
};
