import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    Target,
    Users,
    Settings,
    PieChart,
    ScrollText,
} from 'lucide-react';

const menuItems = [
    { path: '/', label: 'Inicio', icon: LayoutDashboard },
    { path: '/finanzas', label: 'Finanzas', icon: LayoutDashboard }, // Dashboard
    { path: '/caja-diaria', label: 'Ingresos', icon: Wallet },
    { path: '/egresos', label: 'Egresos', icon: PieChart },
    { path: '/produccion', label: 'Producción', icon: TrendingUp },
    { path: '/metas', label: 'Metas', icon: Target },
    { path: '/pacientes', label: 'Pacientes', icon: Users },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
    { path: '/aranceles', label: 'Aranceles', icon: ScrollText },
];

interface SidebarProps {
    currentUser: {
        name: string;
        role: string;
    };
}

export default function Sidebar({ currentUser }: SidebarProps) {
    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Wallet size={24} />
                </div>
                <div className="logo-text">
                    <span className="logo-title">VitaFINANCE</span>
                    <span className="logo-subtitle">GESTIÓN DE BIENESTAR</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'nav-item-active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="sidebar-user">
                <div className="user-avatar">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=5dc0bb&color=fff`}
                        alt={currentUser.name}
                    />
                </div>
                <div className="user-info">
                    <span className="user-name">{currentUser.name}</span>
                    <span className="user-role">{currentUser.role}</span>
                </div>
            </div>
        </aside>
    );
}
