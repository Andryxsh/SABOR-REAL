# 🎵 Sabor Real - Sistema de Gestión

Sistema completo de gestión para la agrupación musical **Sabor Real**, desarrollado con React + TypeScript + Firebase.

## 🚀 Características Principales

### 👥 Gestión de Músicos
- ✅ **Soft Delete**: Los músicos se marcan como inactivos en lugar de eliminarse
- ✅ **Categorías**: Músicos, Staff, Choferes
- ✅ **Tarifas por Tipo de Evento**: Privado, Discoteca, Viaje
- ✅ **Búsqueda Global**: Filtro por nombre, apellido, apodo, rol o CI
- ✅ **Avatar Optimizado**: Imágenes WebP para mejor rendimiento

### 📅 Gestión de Eventos
- ✅ **Estados**: Pendiente, Confirmado, Finalizado, Cancelado
- ✅ **Tipos**: Privado, Discoteca, Viaje
- ✅ **Asignación Automática**: Todos los músicos activos se asignan automáticamente
- ✅ **Gestión de Asistencia**: Control de quién asistió al evento
- ✅ **Bloqueo de Eventos**: Protección contra cambios accidentales
- ✅ **Edición Completa**: Modal con todos los campos del evento

### 💰 Sistema Financiero
- ✅ **Dashboard de Finanzas**: Balance general en tiempo real
- ✅ **Registro de Pagos**: Control de pagos a músicos
- ✅ **Registro de Gastos**: Categorización de gastos operativos
- ✅ **Ingresos por Evento**: Visualización de eventos confirmados/finalizados
- ✅ **Paginación**: Carga inicial de 3 ítems con botón "Ver más"
- ✅ **Cálculo Global de Deudas**: Sistema de balance por músico

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS con tema oscuro personalizado
- **Backend**: Firebase (Firestore + Authentication)
- **Iconos**: Material Symbols
- **Routing**: React Router v6

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 🔧 Scripts Útiles

### Optimización de Imágenes
Convierte imágenes a formato WebP para mejor rendimiento:
```bash
python3 optimize_images.py
```

### Migración de Datos
Abre en tu navegador para migrar usuarios:
```
http://localhost:5173/migrate.html
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── CustomSelect.tsx
│   └── ProfileModal.tsx
├── context/            # Contextos de React
│   ├── AppContext.tsx  # Estado global de la app
│   └── AuthContext.tsx # Autenticación
├── lib/                # Configuraciones
│   └── firebase.ts     # Config de Firebase
├── pages/              # Páginas principales
│   ├── Dashboard.tsx
│   ├── Events.tsx
│   ├── EventDetail.tsx
│   ├── Musicians.tsx
│   ├── Finance.tsx
│   └── Login.tsx
└── ui/                 # Componentes de UI
    └── Layout.tsx
```

## 🎨 Diseño y UX

- **Dark Mode Premium**: Tema oscuro con efectos glassmorphism
- **Responsive**: Optimizado para móviles y desktop
- **Animaciones**: Transiciones suaves y micro-interacciones
- **Portales**: Modales que se renderizan en document.body
- **Performance**: Lazy loading y paginación para listas grandes

## 🔐 Seguridad

- Autenticación con Firebase Auth
- Reglas de seguridad en Firestore
- Variables de entorno para configuración sensible

## 📝 Notas Importantes

- El archivo `serviceAccountKey.json` NO debe subirse a Git
- Las reglas de Firestore están en `firestore.rules`
- Los avatares por defecto están en `/public/assets/default_avatar.webp`

## 👤 Desarrollado por

Andy - Sabor Real Management System

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2026
