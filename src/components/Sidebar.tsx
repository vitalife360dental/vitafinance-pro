import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  Target,

  ScrollText,
  LogOut,
  Package,
  Landmark
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-100 flex flex-col z-50 font-sans">
      {/* ... (First part remains same until User Area) ... */}
      <div className="p-8 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          <Wallet size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-none tracking-tight">VitaFINANCE</h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Gestión de Bienestar</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 py-4">
        <NavItem to="/" icon={LayoutDashboard} label="Inicio" />
        <NavItem to="/ingresos" icon={TrendingUp} label="Ingresos" />
        <NavItem to="/egresos" icon={TrendingDown} label="Egresos" />
        <NavItem to="/produccion" icon={FileText} label="Producción" />
        <NavItem to="/insumos" icon={Package} label="Rentabilidad" />
        <NavItem to="/metas" icon={Target} label="Metas" />
        <NavItem to="/pagos" icon={Wallet} label="Pagos" />
        <NavItem to="/aranceles" icon={ScrollText} label="Aranceles" />
        <NavItem to="/sri-audit" icon={Landmark} label="SRI Auditoría" />
      </div>

      {/* User / Logout Area */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group text-left"
        >
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-500/20">
            {user?.role === 'admin' ? 'JC' : 'AS'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-xs font-medium text-slate-500 truncate capitalize">
              {user?.role === 'admin' ? 'Administrador' : 'Modo Asistente'}
            </p>
          </div>
          <LogOut size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </aside>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium
        ${isActive
          ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      <Icon size={20} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}
