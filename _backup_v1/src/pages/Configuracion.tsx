import { Building2, Palette, Bell, Shield, Database, HelpCircle } from 'lucide-react';

const settingsCategories = [
    {
        id: 'clinic',
        icon: Building2,
        title: 'Datos de la Clínica',
        description: 'Nombre, dirección, RUC y datos fiscales',
        status: 'configured',
    },
    {
        id: 'appearance',
        icon: Palette,
        title: 'Apariencia',
        description: 'Colores, logo y personalización visual',
        status: 'configured',
    },
    {
        id: 'notifications',
        icon: Bell,
        title: 'Notificaciones',
        description: 'Alertas de pagos y recordatorios',
        status: 'pending',
    },
    {
        id: 'security',
        icon: Shield,
        title: 'Seguridad',
        description: 'Contraseñas y accesos de usuarios',
        status: 'configured',
    },
    {
        id: 'database',
        icon: Database,
        title: 'Base de Datos',
        description: 'Conexión a Supabase y sincronización',
        status: 'pending',
    },
    {
        id: 'help',
        icon: HelpCircle,
        title: 'Ayuda y Soporte',
        description: 'Documentación y contacto',
        status: 'configured',
    },
];

export default function Configuracion() {
    return (
        <div className="configuracion-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">
                        Configuración <span className="title-emoji">⚙️</span>
                    </h1>
                    <p className="page-subtitle">Personaliza VitaFINANCE según las necesidades de tu clínica.</p>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="settings-grid">
                {settingsCategories.map((category) => (
                    <div key={category.id} className="settings-card">
                        <div className="settings-card-icon">
                            <category.icon size={24} />
                        </div>
                        <div className="settings-card-content">
                            <h3 className="settings-card-title">{category.title}</h3>
                            <p className="settings-card-description">{category.description}</p>
                        </div>
                        <div className={`settings-status ${category.status}`}>
                            {category.status === 'configured' ? '✓ Configurado' : '○ Pendiente'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Card */}
            <div className="info-card">
                <h3>Conexión a Base de Datos</h3>
                <p>
                    VitaFINANCE se conectará a la misma base de datos Supabase que DentalFlow Pro.
                    Esta configuración se realizará en la fase final de implementación.
                </p>
                <div className="connection-status">
                    <span className="status-indicator pending"></span>
                    <span>Pendiente de configuración</span>
                </div>
            </div>
        </div>
    );
}
