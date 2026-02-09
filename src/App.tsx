import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Finanzas from './pages/Finanzas';
import Ingresos from './pages/Ingresos';
import Egresos from './pages/Egresos';
import Aranceles from './pages/Aranceles';
import Produccion from './pages/Produccion';
import Insumos from './pages/Insumos';
import Metas from './pages/Metas';
import Pagos from './pages/Pagos';
import SRI from './pages/SRI';
import { useAuth } from './context/AuthContext';
import { PinEntry } from './components/auth/PinEntry';

// Placeholder for other routes that we haven't built yet
function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500">Esta sección está actualmente en construcción.</p>
        </div>
    );
}

function App() {
    const { role, isLoading, user } = useAuth();

    console.log('App State:', { role, isLoading, user });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Iniciando VitaFINANCE...</h2>
                    <p className="text-slate-400 text-sm">Cargando configuración de seguridad</p>
                </div>
            </div>
        );
    }

    if (!role) {
        console.log('No role found, rendering PinEntry');
        return <PinEntry />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />

                    {/* Core Financial Modules */}
                    <Route path="finanzas" element={<Finanzas />} />
                    <Route path="ingresos" element={<Ingresos />} />
                    <Route path="egresos" element={<Egresos />} />

                    {/* Management Modules */}
                    <Route path="produccion" element={<Produccion />} />
                    <Route path="insumos" element={<Insumos />} />
                    <Route path="metas" element={<Metas />} />
                    <Route path="aranceles" element={<Aranceles />} />
                    <Route path="pagos" element={<Pagos />} />
                    <Route path="sri-audit" element={<SRI />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
