# VitaFINANCE Pro 🦷

Sistema integral de gestión financiera para clínicas odontológicas, diseñado para maximizar la rentabilidad y automatizar la transparencia de pagos.

## 🚀 Características Principales

- **Dashboard Real-Time**: Visualización de ingresos, egresos y utilidad neta.
- **Aranceles Dinámicos**: Configuración de reglas de pago por doctor, especialidad o tratamiento específico.
- **Deducción de Laboratorio**: Despacho automático de costos de laboratorio antes de calcular aranceles médicos.
- **Auditoría SRI**: Seguimiento de la brecha fiscal y cumplimiento de facturación.
- **Análisis de Rentabilidad**: Desglose por silla odontológica y tiempo operativo.

## 🛠 Tecnologías

- **Fronend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS (Rich Aesthetics)
- **Backend**: Supabase (PostgreSQL + RLS)
- **Despliegue**: Cloudflare Pages

## 📦 Despliegue en Cloudflare Pages

Este proyecto está optimizado para **Cloudflare Pages**. Sigue estos pasos:

1. **Conecta GitHub**: Ve a tu panel de Cloudflare -> Workers & Pages -> Create Application -> Pages -> Connect to Git.
2. **Selecciona Repositorio**: Elige el repositorio `vitafinance-pro`.
3. **Configuración de Build**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. **Variables de Entorno**: Agrega tus variables de Supabase:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Listo**: Cloudflare detectará automáticamente el archivo `public/_redirects` para manejar las rutas del sistema (SPA).

## 📄 Licencia

Privado - Uso exclusivo para VitaLife 360 Dental.
