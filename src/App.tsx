import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigate as NavigateComponent } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Finance from './pages/Finance';
import Musicians from './pages/Musicians';
import EventDetail from './pages/EventDetail';
import Layout from './ui/Layout';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
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
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Protected Routes (nested under Layout for persistent bottom bar) */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/musicians" element={<Musicians />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
