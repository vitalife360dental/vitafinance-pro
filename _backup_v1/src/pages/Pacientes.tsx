import { useState, useEffect } from 'react';
import { Search, Phone, Mail, Eye } from 'lucide-react';
import { financeService } from '../services/financeService';
import { PageLayout } from '../components/ui/PageLayout';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';

interface Patient {
    id: string;
    name: string;
    email: string;
    phone: string;
    lastVisit: string;
}

export default function Pacientes() {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const data = await financeService.getPatients();
            setPatients(data);
        } catch (error) {
            console.error('Error loading patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'Paciente',
            cell: (patient: Patient) => (
                <div className="flex items-center gap-3">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=5dc0bb&color=fff`}
                        alt={patient.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium text-slate-900">{patient.name}</span>
                </div>
            )
        },
        {
            header: 'Contacto',
            cell: (patient: Patient) => (
                <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        <span>{patient.phone}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Última Actividad',
            accessorKey: 'lastVisit' as keyof Patient,
            cell: (patient: Patient) => (
                <span>{new Date(patient.lastVisit).toLocaleDateString('es-EC')}</span>
            )
        },
        {
            header: 'Fuente',
            cell: () => (
                <Badge variant="blue">DentalFlow</Badge>
            )
        },
        {
            header: 'Estado',
            cell: () => (
                <Badge variant="success">Sincronizado</Badge>
            )
        },
        {
            header: 'Acciones',
            cell: () => (
                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye size={18} />
                </button>
            )
        }
    ];

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando pacientes...</div>;

    return (
        <PageLayout
            title="Pacientes 👥"
            subtitle="Visualiza tus pacientes sincronizados desde DentalFlow."
        >
            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar paciente por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            {/* Data Table */}
            <DataTable
                data={filteredPatients}
                columns={columns}
            />
        </PageLayout>
    );
}

