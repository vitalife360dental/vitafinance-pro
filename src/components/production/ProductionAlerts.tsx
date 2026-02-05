import { AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';

export default function ProductionAlerts({ data }: { data: any }) {
    if (!data) return null;
    const { doctors, treatments, chairs } = data;

    // RULE ENGINE 🧠
    const alerts: any[] = [];

    // 1. Check Low Margin Treatments (< 20%)
    treatments.forEach((t: any) => {
        if (t.marginPercent < 20) {
            alerts.push({
                type: 'warning',
                title: 'Tratamiento con Bajo Margen',
                message: `El tratamiento "${t.name}" tiene un margen del ${t.marginPercent.toFixed(1)}%, lo cual es inferior al ideal del 20%.`,
                metric: `${t.marginPercent.toFixed(1)}%`
            });
        }
    });

    // 2. Check Unprofitable Chairs (Utility < $1000 - just for demo threshold)
    chairs.forEach((c: any) => {
        if (c.hourlyRate < 20 && c.hours > 10) { // If used a lot but low hourly income
            alerts.push({
                type: 'danger',
                title: 'Sillón Improductivo',
                message: `El "${c.name}" está generando solo $${c.hourlyRate.toFixed(0)}/hora, a pesar de tener uso. Revisar asignación de tratamientos.`,
                metric: `$${c.hourlyRate.toFixed(0)}/hr`
            });
        }
    });

    // 3. Detect "Star" Doctors (High contribution)
    const starDoctor = doctors[0];
    if (starDoctor) {
        alerts.push({
            type: 'info',
            title: 'Doctor Estrella del Período',
            message: `El Dr. ${starDoctor.name} ha generado el mayor aporte neto a la clínica esta semana. ¡Felicítalo!`,
            metric: `$${starDoctor.netContribution.toFixed(0)}`
        });
    }

    if (alerts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">¡Todo en orden!</h3>
                <p className="text-slate-500 max-w-sm mt-2">No se han detectado anomalías financieras graves en este período. Excelente gestión.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                <AlertCircle className="text-red-500" />
                Alertas Financieras Detectadas
            </h3>

            <div className="grid gap-4">
                {alerts.map((alert, i) => (
                    <AlertCard key={i} alert={alert} />
                ))}
            </div>
        </div>
    );
}

function AlertCard({ alert }: any) {
    const styles: any = {
        warning: { border: 'border-orange-200', bg: 'bg-orange-50', icon: 'text-orange-500', iconBg: 'bg-orange-100' },
        danger: { border: 'border-red-200', bg: 'bg-red-50', icon: 'text-red-500', iconBg: 'bg-red-100' },
        info: { border: 'border-blue-200', bg: 'bg-blue-50', icon: 'text-blue-500', iconBg: 'bg-blue-100' },
    };

    const s = styles[alert.type] || styles.info;

    return (
        <div className={`flex items-start gap-4 p-5 rounded-xl border ${s.border} ${s.bg} relative overflow-hidden transition-all hover:scale-[1.01]`}>
            <div className={`p-3 rounded-lg ${s.iconBg} ${s.icon} shrink-0`}>
                <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
                <h4 className={`font-bold ${s.icon}`}>{alert.title}</h4>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{alert.message}</p>
            </div>
            {alert.metric && (
                <div className="bg-white/60 px-3 py-1.5 rounded-lg font-bold text-slate-700 text-sm self-center">
                    {alert.metric}
                </div>
            )}
        </div>
    );
}
