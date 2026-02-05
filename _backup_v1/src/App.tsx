import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Inicio from './pages/Inicio';
import CajaDiaria from './pages/CajaDiaria';
import Produccion from './pages/Produccion';
import Metas from './pages/Metas';
import Pacientes from './pages/Pacientes';
import Finanzas from './pages/Finanzas';
import Egresos from './pages/Egresos';
import Configuracion from './pages/Configuracion';
import Aranceles from './pages/Aranceles';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Inicio />} />
          <Route path="caja-diaria" element={<CajaDiaria />} />
          <Route path="finanzas" element={<Finanzas />} />
          <Route path="egresos" element={<Egresos />} />
          <Route path="produccion" element={<Produccion />} />
          <Route path="metas" element={<Metas />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="aranceles" element={<Aranceles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
