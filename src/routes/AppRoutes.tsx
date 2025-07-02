import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProfilePage from "../pages/profile/ProfilePage";
import ServicesPage from "../pages/services/ServicesPage";
import AppointmentsPage from "../pages/appointments/AppointmentBookingPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ProductsPage from "../pages/Products/ProductsPage";
import ServiceDetailPage from "../pages/services/components/ServiceDetailPage";
import ProductDetailPage from "../pages/Products/components/ProductDetailPage";
import CartPage from "../pages/cart/CartPage";
import PickupsPage from "../pages/pickups/PickupsPage";
import AppointmentBookingPage from "../pages/appointments/AppointmentBookingPage";
import AppointmentConfirmationPage from "../pages/appointments/components/AppointmentConfirmationPage";
import AppointmentHistoryPage from "../pages/appointments/AppointmentHistoryPage";
import UserAppointmentsPage from "../pages/appointments/UserAppointmentsPage";

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Verifica si el usuario está autenticado

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirige a login si no está autenticado
  }

  return children; // Renderiza el componente protegido si está autenticado
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas de autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Ruta raíz: Redirige al dashboard si está autenticado, de lo contrario al login */}
        <Route
          path="/"
          element={
            <Navigate
              to={localStorage.getItem("token") ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        {/* Rutas del Dashboard (requieren autenticación) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProductsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products/:productId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProductDetailPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/cart"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CartPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/pickups"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PickupsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/appointments"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AppointmentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/services"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ServicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/services/:serviceId/book"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AppointmentBookingPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/appointments/confirmation"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AppointmentConfirmationPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/dashboard/my-appointments"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserAppointmentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Nueva ruta para historial de citas */}
        <Route
          path="/dashboard/appointment-history"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AppointmentHistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/services/:serviceId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ServiceDetailPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
