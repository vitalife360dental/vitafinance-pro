import { TrendingUp, TrendingDown, Clock, Users, DollarSign } from 'lucide-react';
import { KpiCard } from '../ui/KpiCard';
import { Card } from '../ui/Card';
import { IncomeExpenseChart, ExpenseCategoryChart } from '../FinanceCharts';

interface FinancialOverviewProps {
    metrics: {
        totalIncome: number;
        totalExpense: number;
        totalReceivable: number;
        totalPatients: number;
    };
    transactions: any[];
}

export function FinancialOverview({ metrics, transactions }: FinancialOverviewProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Left Block (2/3): KPI Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Primary Card - Blue Gradient */}
                <KpiCard
                    title="Ingresos Totales"
                    value={`$${metrics.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    variant="primary"
                    trend={{ value: '+2.4%', direction: 'up' }}
                />

                <KpiCard
                    title="Egresos Totales"
                    value={`$${metrics.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon={TrendingDown}
                    color="rose"
                    trend={{ value: '-1.2%', direction: 'down' }}
                />

                <KpiCard
                    title="Por Cobrar"
                    value={`$${metrics.totalReceivable.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon={Clock}
                    color="amber"
                />

                <KpiCard
                    title="Pacientes"
                    value={metrics.totalPatients.toString()}
                    icon={Users}
                    color="blue"
                    trend={{ value: '+4', direction: 'up' }}
                />
            </div>

            {/* Right Block (1/3): Tall Chart (Donut) */}
            <div className="lg:col-span-1">
                <Card className="h-full min-h-[300px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">Gastos por Categoría</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <ExpenseCategoryChart transactions={transactions} />
                    </div>
                </Card>
            </div>

            {/* Bottom Block (Full Width): Wide Chart (Area) */}
            <div className="lg:col-span-3">
                <Card className="h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">Evolución Financiera</h3>
                    </div>
                    <IncomeExpenseChart transactions={transactions} />
                </Card>
            </div>
        </div>
    );
}
