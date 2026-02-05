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
// import SRI from './pages/SRI';

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
    return (
        <BrowserRouter>
            <Routes>
                {/* Emergency Route - Bypass Layout - TEST ONLY */}
                <Route path="/audit-test" element={<div className="p-10 text-4xl text-red-600 font-bold">SI VES ESTO, EL ROUTER FUNCIONA. EL ERROR ESTÁ EN OTRO LADO.</div>} />

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
                    <Route path="pacientes" element={<PlaceholderPage title="Pacientes" />} />
                    <Route path="aranceles" element={<Aranceles />} />
                    <Route path="sri-audit" element={<SRI />} />

                    {/* Configuration */}
                    <Route path="configuracion" element={<PlaceholderPage title="Configuración" />} />

                    {/* Test Route Inside Layout */}
                    <Route path="prueba" element={<div className="p-10 text-4xl text-blue-600 font-bold h-screen bg-white">SI VES ESTO, EL ROUTER FUNCIONA DENTRO DEL LAYOUT.</div>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
