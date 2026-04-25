import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import AddAutoPage from './pages/features/AddAutoPage';
import AddRouteInfoPage from './pages/features/AddRouteInfoPage';
import AddDriverPage from './pages/features/AddDriverPage';
import AssignRoutePage from './pages/features/AssignRoutePage';
import VisualMappingPage from './pages/features/VisualMappingPage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Router>
      {isAuthenticated ? (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/add-auto"
                element={
                  <ProtectedRoute>
                    <AddAutoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-route"
                element={
                  <ProtectedRoute>
                    <AddRouteInfoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-driver"
                element={
                  <ProtectedRoute>
                    <AddDriverPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assign-route"
                element={
                  <ProtectedRoute>
                    <AssignRoutePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visual-mapping"
                element={
                  <ProtectedRoute>
                    <VisualMappingPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
