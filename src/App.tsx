import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigate as NavigateComponent } from 'react-router-dom';

// Contextos Core
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Global Store Initializer (Nivel Máximo 🚀)
import { useGlobalStoreInitializer } from './application/hooks/useGlobalStoreInitializer';

// Lazy Loaded Pages (Nivel Máximo 🚀)
const LoginV2 = React.lazy(() => import('./presentation/pages/Login'));
const DashboardV2 = React.lazy(() => import('./presentation/pages/Dashboard'));
const EventsV2 = React.lazy(() => import('./presentation/pages/Events'));
const EventDetailV2 = React.lazy(() => import('./presentation/pages/EventDetail'));
const MusiciansV2 = React.lazy(() => import('./presentation/pages/Musicians'));
const MusicianDetailV2 = React.lazy(() => import('./presentation/pages/MusicianDetail'));
const FinanceV2 = React.lazy(() => import('./presentation/pages/Finance'));
const Profile = React.lazy(() => import('./presentation/pages/Profile'));
const Settings = React.lazy(() => import('./presentation/pages/Settings'));

// Componente de Carga (Spinner Premium)
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-black text-white">
    <div className="flex flex-col items-center gap-4">
      <div className="size-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black uppercase tracking-widest text-white/40">Cargando Módulo...</p>
    </div>
  </div>
);

// Componente de Ruta Protegida (CON inicialización de stores)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Inicializar stores SOLO cuando el usuario está autenticado
  useGlobalStoreInitializer();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <NavigateComponent to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* RUTA PÚBLICA: LOGIN */}
              <Route path="/" element={<LoginV2 />} />

              {/* RUTAS PROTEGIDAS DEL SISTEMA V2 */}
              <Route path="/dashboard" element={<ProtectedRoute> <DashboardV2 /> </ProtectedRoute>} />

              {/* RUTAS V2 (Mappings directos y legacy support si es necesario) */}
              <Route path="/v2/dashboard" element={<Navigate to="/dashboard" replace />} />

              <Route path="/events" element={<ProtectedRoute> <EventsV2 /> </ProtectedRoute>} />
              <Route path="/v2/events" element={<Navigate to="/events" replace />} />

              <Route path="/event/:id" element={<ProtectedRoute> <EventDetailV2 /> </ProtectedRoute>} />
              <Route path="/v2/event/:id" element={<Navigate to="/event/:id" replace />} />

              <Route path="/musicians" element={<ProtectedRoute> <MusiciansV2 /> </ProtectedRoute>} />
              <Route path="/v2/musicians" element={<Navigate to="/musicians" replace />} />

              <Route path="/musician/:id" element={<ProtectedRoute> <MusicianDetailV2 /> </ProtectedRoute>} />
              <Route path="/v2/musician/:id" element={<Navigate to="/musician/:id" replace />} />

              <Route path="/finance" element={<ProtectedRoute> <FinanceV2 /> </ProtectedRoute>} />
              <Route path="/v2/finance" element={<Navigate to="/finance" replace />} />

              <Route path="/perfil" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
              <Route path="/configuracion" element={<ProtectedRoute> <Settings /> </ProtectedRoute>} />

              {/* Fallback para rutas no encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
