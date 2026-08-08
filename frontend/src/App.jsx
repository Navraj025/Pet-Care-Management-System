import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyPetsPage from './pages/customer/MyPetsPage';
import PetDetailPage from './pages/customer/PetDetailPage';
import BookAppointmentWizard from './pages/customer/BookAppointmentWizard';
import MyAppointmentsPage from './pages/customer/MyAppointmentsPage';
import MedicalRecordsPage from './pages/customer/MedicalRecordsPage';
import VaccinationsPage from './pages/customer/VaccinationsPage';
import PaymentsInvoicesPage from './pages/customer/PaymentsInvoicesPage';
import InvoiceViewPage from './pages/customer/InvoiceViewPage';
import NotificationsPage from './pages/customer/NotificationsPage';
import ReviewsPage from './pages/customer/ReviewsPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffAppointmentsPage from './pages/staff/StaffAppointmentsPage';
import StaffPetsPage from './pages/staff/StaffPetsPage';
import StaffMedicalRecordsPage from './pages/staff/StaffMedicalRecordsPage';
import StaffVaccinationsPage from './pages/staff/StaffVaccinationsPage';
import StaffAvailabilityPage from './pages/staff/StaffAvailabilityPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Customer Routes */}
            <Route
              path="/customer"
              element={<DashboardLayout allowedRoles={['CUSTOMER']} title="Customer Portal" />}
            >
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="pets" element={<MyPetsPage />} />
              <Route path="pets/:id" element={<PetDetailPage />} />
              <Route path="book-appointment" element={<BookAppointmentWizard />} />
              <Route path="appointments" element={<MyAppointmentsPage />} />
              <Route path="medical-records" element={<MedicalRecordsPage />} />
              <Route path="vaccinations" element={<VaccinationsPage />} />
              <Route path="payments" element={<PaymentsInvoicesPage />} />
              <Route path="invoices/:id" element={<InvoiceViewPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
            </Route>

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={<DashboardLayout allowedRoles={['STAFF', 'ADMIN']} title="Staff & Vet Portal" />}
            >
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="appointments" element={<StaffAppointmentsPage />} />
              <Route path="pets" element={<StaffPetsPage />} />
              <Route path="medical-records" element={<StaffMedicalRecordsPage />} />
              <Route path="vaccinations" element={<StaffVaccinationsPage />} />
              <Route path="availability" element={<StaffAvailabilityPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<DashboardLayout allowedRoles={['ADMIN']} title="Admin Operations Portal" />}
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="pets" element={<StaffPetsPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="availability" element={<StaffAvailabilityPage />} />
              <Route path="payments" element={<PaymentsInvoicesPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
