import { useState } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Plus, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Mock Data for MVP
const MOCK_INVENTORY = [
    { id: 1, name: 'Anestesia Lidocaína', category: 'Fármacos', stock: 15, unit: 'Cajas (50u)', minStock: 5, status: 'ok' },
    { id: 2, name: 'Guantes Nitrilo M', category: 'Desechables', stock: 3, unit: 'Cajas (100u)', minStock: 10, status: 'low' },
    { id: 3, name: 'Resina Compuesta A2', category: 'Materiales', stock: 8, unit: 'Jeringas', minStock: 3, status: 'ok' },
    { id: 4, name: 'Gasas Estériles', category: 'Desechables', stock: 25, unit: 'Paquetes', minStock: 10, status: 'ok' },
    { id: 5, name: 'Agujas Cortas 30G', category: 'Desechables', stock: 2, unit: 'Cajas (100u)', minStock: 5, status: 'critical' },
];

export default function Insumos() {
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory] = useState(MOCK_INVENTORY);

    const filteredItems = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string, stock: number) => {
        if (status === 'critical' || stock <= 2) {
            return <Badge variant="error" className="flex items-center gap-1"><AlertTriangle size={12} /> Crítico</Badge>;
        }
        if (status === 'low' || stock <= 5) {
            return <Badge variant="warning" className="flex items-center gap-1"><AlertTriangle size={12} /> Bajo Stock</Badge>;
        }
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 size={12} /> En Stock</Badge>;
    };

    return (
        <PageContainer>
            <PageHeader
                title="Gestión de Insumos"
                subtitle="Control de inventario y materiales clínicos."
            >
                <button className="flex items-center gap-2 bg-[#5dc0bb] text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-[#4ab0ab] transition-colors">
                    <Plus size={18} />
                    <span>Nuevo Insumo</span>
                </button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Insumos</p>
                        <h3 className="text-2xl font-bold text-slate-900">{inventory.length}</h3>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Stock Bajo</p>
                        <h3 className="text-2xl font-bold text-slate-900">
                            {inventory.filter(i => i.status === 'low' || i.status === 'critical').length}
                        </h3>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Stock Óptimo</p>
                        <h3 className="text-2xl font-bold text-slate-900">
                            {inventory.filter(i => i.status === 'ok').length}
                        </h3>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden" noPadding>
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-white">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar insumo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5dc0bb]/20 focus:border-[#5dc0bb] transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Nombre del Insumo</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Unidad</th>
                                <th className="px-6 py-4 text-center">Stock Actual</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="neutral">{item.category}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {item.unit}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                                        {item.stock}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center">
                                        {getStatusBadge(item.status, item.stock)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-[#5dc0bb] hover:underline font-medium text-xs">
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageContainer>
    );
}
