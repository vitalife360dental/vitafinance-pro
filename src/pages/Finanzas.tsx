
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Filter, Download, Search } from 'lucide-react';

export default function Finanzas() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Transacciones</h1>
                    <p className="text-slate-500 mt-1">Historial completo de tus movimientos financieros.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" leftIcon={<Download size={16} />}>Exportar CSV</Button>
                    <Button>Nueva Transacción</Button>
                </div>
            </div>

            <Card className="overflow-hidden" noPadding>
                {/* Filters Bar */}
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar transacción..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5dc0bb] focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>Filtros</Button>
                        <Button variant="ghost" size="sm">Limpiar</Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Transacción</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                {i % 2 === 0 ? 'A' : 'N'}
                                            </div>
                                            <span className="font-semibold text-slate-900">
                                                {i % 2 === 0 ? 'Amazon Marketplace' : 'Netflix Subscription'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {i % 2 === 0 ? 'Compras Online' : 'Entretenimiento'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">Feb {10 - i}, 2024</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={i === 1 ? 'warning' : 'success'}>
                                            {i === 1 ? 'Pendiente' : 'Completado'}
                                        </Badge>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-medium ${i % 2 === 0 ? 'text-slate-900' : 'text-slate-900'}`}>
                                        -${(Math.random() * 100).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                            Editar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-sm text-slate-500">Mostrando 1-7 de 24 resultados</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Anterior</Button>
                        <Button variant="outline" size="sm">Siguiente</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
